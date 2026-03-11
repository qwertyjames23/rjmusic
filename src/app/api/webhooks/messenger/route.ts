import { NextRequest, NextResponse } from "next/server";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;

// ─── Facebook Messenger Webhook Verification ─────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Messenger webhook verified");
        return new Response(challenge, { status: 200 });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ─── Send Messenger Message ───────────────────────────────────────────────────

async function sendMessage(recipientId: string, text: string) {
    if (!PAGE_ACCESS_TOKEN) {
        console.error("PAGE_ACCESS_TOKEN is not set");
        return;
    }

    const res = await fetch(
        `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient: { id: recipientId },
                messaging_type: "RESPONSE",
                message: { text },
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to send Messenger message:", err);
    }
}

// ─── Handle Incoming Messenger Events ────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.object !== "page") {
            return NextResponse.json({ error: "Not a page event" }, { status: 404 });
        }

        for (const entry of body.entry ?? []) {
            for (const event of entry.messaging ?? []) {
                const senderId: string = event.sender?.id;
                if (!senderId) continue;

                // Handle text messages
                if (event.message && !event.message.is_echo) {
                    const text: string = event.message.text ?? "";

                    // Auto-reply: greet and guide the user
                    const reply = buildAutoReply(text);
                    await sendMessage(senderId, reply);
                }

                // Handle postbacks (e.g., Get Started button)
                if (event.postback) {
                    const payload: string = event.postback.payload ?? "";
                    await handlePostback(senderId, payload);
                }
            }
        }

        // Facebook expects a 200 OK quickly
        return NextResponse.json({ status: "ok" });
    } catch (error: unknown) {
        console.error("Messenger webhook error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ─── Auto-reply Logic (applies to ALL users equally) ─────────────────────────

function buildAutoReply(text: string): string {
    const lower = text.toLowerCase().trim();

    if (lower.match(/\b(hello|hi|hey|kamusta|uy|oi)\b/)) {
        return (
            "Hi! Welcome to RJ Music Shop! 🎸\n\n" +
            "How can we help you today? You can:\n" +
            "• Browse our products at https://www.rjmusic.shop\n" +
            "• Ask about your order status\n" +
            "• Inquire about our instruments and gear\n\n" +
            "We typically reply within minutes. 😊"
        );
    }

    if (lower.match(/\border\b|status|track/)) {
        return (
            "To check your order status, please visit:\n" +
            "https://www.rjmusic.shop/profile/purchases\n\n" +
            "If you need further help, our team will get back to you shortly!"
        );
    }

    if (lower.match(/\bprice\b|magkano|how much|cost/)) {
        return (
            "You can view all our product prices at:\n" +
            "https://www.rjmusic.shop\n\n" +
            "Feel free to ask if you need help finding a specific item! 🎵"
        );
    }

    // Default reply for all other messages
    return (
        "Thank you for messaging RJ Music Shop! 🎶\n\n" +
        "Our team has received your message and will reply shortly.\n" +
        "You can also visit our store at https://www.rjmusic.shop"
    );
}

async function handlePostback(senderId: string, payload: string) {
    if (payload === "GET_STARTED") {
        await sendMessage(
            senderId,
            "Welcome to RJ Music Shop! 🎸\n\n" +
            "We sell quality musical instruments and gear in the Philippines.\n\n" +
            "Visit our store: https://www.rjmusic.shop\n\n" +
            "How can we help you today?"
        );
    }
}
