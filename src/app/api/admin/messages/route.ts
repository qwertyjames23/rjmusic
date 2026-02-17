import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/supabase/server";

// GET: List all conversations for admin
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations });
}

// PATCH: Mark conversation as read
export async function PATCH(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    try {
        const { conversation_id } = await req.json();

        if (!conversation_id) {
            return NextResponse.json({ error: "conversation_id required" }, { status: 400 });
        }

        // Mark all messages in this conversation as read
        await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("conversation_id", conversation_id)
            .eq("is_from_admin", false);

        // Reset unread count
        await supabase
            .from("conversations")
            .update({ unread_count: 0 })
            .eq("id", conversation_id);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Mark read error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
