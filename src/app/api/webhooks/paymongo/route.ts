
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

function verifyPaymongoSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    // PayMongo signature format: t=<timestamp>,te=<test_signature>,li=<live_signature>
    const parts = signatureHeader.split(",");
    const timestampPart = parts.find(p => p.startsWith("t="));
    const livePart = parts.find(p => p.startsWith("li="));
    const testPart = parts.find(p => p.startsWith("te="));

    if (!timestampPart) return false;

    const timestamp = timestampPart.replace("t=", "");
    // Use live signature in production, test signature in development
    const signaturePart = livePart || testPart;
    if (!signaturePart) return false;

    const expectedSignature = signaturePart.split("=").slice(1).join("=");
    const payload = `${timestamp}.${rawBody}`;
    const computedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(computedSignature)
    );
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signatureHeader = req.headers.get("paymongo-signature");

        // Verify webhook signature to prevent payment fraud
        const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
        if (webhookSecret) {
            if (!signatureHeader) {
                return NextResponse.json({ error: "Missing signature" }, { status: 401 });
            }
            if (!verifyPaymongoSignature(rawBody, signatureHeader, webhookSecret)) {
                console.error("❌ Invalid webhook signature");
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        } else {
            console.warn("⚠️ PAYMONGO_WEBHOOK_SECRET is not set — webhook signature verification is disabled. Set it in production!");
        }

        const event = JSON.parse(rawBody);
        const type = event.data.attributes.type;
        const resource = event.data.attributes.data;

        console.log(`🔔 PayMongo Webhook Received: ${type}`);

        if (type === 'checkout_session.payment.paid') {
            const description = resource.attributes.line_items[0]?.description || ""; 
            // We stored "Order #UUID" in description
            const orderId = description.replace("Order #", "").trim();

            if (orderId) {
                console.log(`✅ Payment successful for Order: ${orderId}`);
                
                const supabase = createAdminClient();
                
                // Update Order Payment Status AND Order Status
                const { error } = await supabase
                    .from("orders")
                    .update({ 
                        payment_status: "paid",
                        status: "Processing" // Explicitly move to Processing
                    })
                    .eq("id", orderId);

                if (error) {
                    console.error("❌ Failed to update order:", error);
                    return NextResponse.json({ error: "Update failed" }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        console.error("Webhook Error:", error);
        const message = error instanceof Error ? error.message : "Webhook processing failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
