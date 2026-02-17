import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required" },
                { status: 400 }
            );
        }

        const adminSupabase = createAdminClient();

        // Check if a conversation already exists for this email (guest contact)
        const { data: existingConvo } = await adminSupabase
            .from("conversations")
            .select("id")
            .eq("customer_email", email)
            .maybeSingle();

        let convoId: string;

        if (existingConvo) {
            convoId = existingConvo.id;
        } else {
            // Create a new conversation for this contact form submission
            const { data: newConvo, error: convoError } = await adminSupabase
                .from("conversations")
                .insert({
                    customer_name: name,
                    customer_email: email,
                    last_message: message.substring(0, 100),
                    last_message_at: new Date().toISOString(),
                    unread_count: 1,
                })
                .select("id")
                .single();

            if (convoError) {
                console.error("Failed to create conversation:", convoError);
                return NextResponse.json(
                    { error: "Failed to send message" },
                    { status: 500 }
                );
            }
            convoId = newConvo.id;
        }

        // Insert the message
        const formattedContent = `[Contact Form]\nName: ${name}\nEmail: ${email}\n\n${message}`;

        const { error: msgError } = await adminSupabase
            .from("messages")
            .insert({
                conversation_id: convoId,
                content: formattedContent,
                is_from_admin: false,
                is_read: false,
            });

        if (msgError) {
            console.error("Failed to insert message:", msgError);
            return NextResponse.json(
                { error: "Failed to send message" },
                { status: 500 }
            );
        }

        // Update conversation metadata
        if (existingConvo) {
            const { data: convoData } = await adminSupabase
                .from("conversations")
                .select("unread_count")
                .eq("id", convoId)
                .single();

            await adminSupabase
                .from("conversations")
                .update({
                    last_message: message.substring(0, 100),
                    last_message_at: new Date().toISOString(),
                    unread_count: (convoData?.unread_count || 0) + 1,
                })
                .eq("id", convoId);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
