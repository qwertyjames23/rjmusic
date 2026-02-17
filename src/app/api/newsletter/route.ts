import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/supabase/server";

// POST: Subscribe to newsletter
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const trimmed = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        const adminSupabase = createAdminClient();

        // Check if already subscribed
        const { data: existing } = await adminSupabase
            .from("newsletter_subscribers")
            .select("id, status")
            .eq("email", trimmed)
            .maybeSingle();

        if (existing) {
            if (existing.status === "active") {
                return NextResponse.json({ message: "You're already subscribed!" });
            }
            // Re-subscribe
            await adminSupabase
                .from("newsletter_subscribers")
                .update({ status: "active", unsubscribed_at: null })
                .eq("id", existing.id);

            return NextResponse.json({ message: "Welcome back! You've been re-subscribed." });
        }

        // New subscriber
        const { error } = await adminSupabase
            .from("newsletter_subscribers")
            .insert({ email: trimmed });

        if (error) {
            console.error("Newsletter subscribe error:", error);
            return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
        }

        return NextResponse.json({ message: "Successfully subscribed!" });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET: Admin — list all subscribers
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: subscribers, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscribers });
}

// DELETE: Admin — remove subscriber
export async function DELETE(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Subscriber ID required" }, { status: 400 });
        }

        const supabase = await createClient();
        await supabase
            .from("newsletter_subscribers")
            .delete()
            .eq("id", id);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
