import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL, buildOrderConfirmationHtml } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, customerName, customerEmail, items, subtotal, shippingFee, total, shippingAddress, paymentMethod } = body;

    if (!customerEmail || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const html = buildOrderConfirmationHtml({
      orderNumber,
      customerName,
      customerEmail,
      items,
      subtotal,
      shippingFee,
      total,
      shippingAddress,
      paymentMethod,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      replyTo: "rjmusicshop@gmail.com",
      subject: `Order Confirmed - #${orderNumber} | RJ Music`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Email route error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
