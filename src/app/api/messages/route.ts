import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: Fetch messages for the current user's conversation
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversation_id");

    // If conversation_id is provided, verify the requester owns it (or is admin)
    if (conversationId) {
        const adminSupabase = createAdminClient();

        const { data: profile } = await adminSupabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const isAdmin = profile?.role === "admin";

        if (!isAdmin) {
            // Non-admins can only fetch their own conversation
            const { data: ownConvo } = await adminSupabase
                .from("conversations")
                .select("id")
                .eq("id", conversationId)
                .eq("customer_id", user.id)
                .maybeSingle();

            if (!ownConvo) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const { data: messages, error } = await adminSupabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ messages });
    }

    // Customer: get their own conversation + messages
    const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("customer_id", user.id)
        .maybeSingle();

    if (!conversation) {
        return NextResponse.json({ messages: [], conversation: null });
    }

    const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages, conversation });
}

// POST: Send a new message
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { content, conversation_id } = await req.json();

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return NextResponse.json({ error: "Message content is required" }, { status: 400 });
        }

        // Use admin client to bypass RLS for all DB operations
        const adminSupabase = createAdminClient();

        // Fetch profile via admin client (RLS-safe)
        const { data: profile } = await adminSupabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .single();

        const isAdmin = profile?.role === "admin";

        let convoId = conversation_id;

        // If no conversation_id provided, find or create one for the sender
        if (!convoId) {
            const { data: existingConvo } = await adminSupabase
                .from("conversations")
                .select("id")
                .eq("customer_id", user.id)
                .maybeSingle();

            if (existingConvo) {
                convoId = existingConvo.id;
            } else {
                const { data: newConvo, error: convoError } = await adminSupabase
                    .from("conversations")
                    .insert({
                        customer_id: user.id,
                        customer_name: profile?.full_name || user.email?.split("@")[0] || "Customer",
                        customer_email: user.email,
                        last_message: content.trim().substring(0, 100),
                        last_message_at: new Date().toISOString(),
                        unread_count: 1,
                    })
                    .select("id")
                    .single();

                if (convoError) {
                    return NextResponse.json({ error: convoError.message }, { status: 500 });
                }
                convoId = newConvo?.id;
            }
        }

        if (!convoId) {
            return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
        }

        // Insert the message using admin client to bypass RLS
        const { data: message, error: msgError } = await adminSupabase
            .from("messages")
            .insert({
                conversation_id: convoId,
                sender_id: user.id,
                content: content.trim(),
                is_from_admin: isAdmin,
                is_read: false,
            })
            .select("*")
            .single();

        if (msgError) {
            console.error("Failed to insert message:", msgError);
            return NextResponse.json({ error: msgError.message }, { status: 500 });
        }

        // Update conversation metadata
        const updateData: Record<string, unknown> = {
            last_message: content.trim().substring(0, 100),
            last_message_at: new Date().toISOString(),
        };

        if (!isAdmin) {
            // Customer sent message — increment unread for admin
            const { data: convoData } = await adminSupabase
                .from("conversations")
                .select("unread_count")
                .eq("id", convoId)
                .single();

            await adminSupabase
                .from("conversations")
                .update({
                    ...updateData,
                    unread_count: (convoData?.unread_count || 0) + 1,
                })
                .eq("id", convoId);
        } else {
            await adminSupabase
                .from("conversations")
                .update(updateData)
                .eq("id", convoId);
        }

        return NextResponse.json({ message, conversation_id: convoId });
    } catch (error: unknown) {
        console.error("Message send error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH: Mark messages as read for the current user
export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { conversation_id } = await req.json();
        if (!conversation_id) {
            return NextResponse.json({ error: "conversation_id required" }, { status: 400 });
        }

        const adminSupabase = createAdminClient();

        // Verify the requester owns this conversation or is admin
        const { data: profile } = await adminSupabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const isAdmin = profile?.role === "admin";

        if (!isAdmin) {
            const { data: ownConvo } = await adminSupabase
                .from("conversations")
                .select("id")
                .eq("id", conversation_id)
                .eq("customer_id", user.id)
                .maybeSingle();

            if (!ownConvo) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Mark all messages NOT sent by me as read
        await adminSupabase
            .from("messages")
            .update({ is_read: true })
            .eq("conversation_id", conversation_id)
            .neq("sender_id", user.id)
            .eq("is_read", false);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
