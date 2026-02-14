import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

function normalizeStatus(input: unknown) {
    if (typeof input !== "string") return "";
    const value = input.trim().toLowerCase();
    const matched = ALLOWED_ORDER_STATUSES.find((s) => s.toLowerCase() === value);
    return matched || "";
}

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || user.email !== process.env.ADMIN_EMAIL) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), supabase };
    }

    return { supabase, user };
}

function getDbClientOrFallback(fallbackClient: Awaited<ReturnType<typeof createClient>>) {
    try {
        return { db: createAdminClient(), usingFallback: false };
    } catch {
        return { db: fallbackClient, usingFallback: true };
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const orderId = body?.order_id as string | undefined;
    const normalizedStatus = normalizeStatus(body?.status);

    if (!orderId || !normalizedStatus) {
        return NextResponse.json({ error: "order_id and valid status are required" }, { status: 400 });
    }

    const { db, usingFallback } = getDbClientOrFallback(auth.supabase);
    const { data: existingOrder, error: existingOrderError } = await db
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

    if (existingOrderError) {
        return NextResponse.json({ error: existingOrderError.message }, { status: 500 });
    }

    const { error } = await db
        .from("orders")
        .update({ status: normalizedStatus })
        .eq("id", orderId);

    if (error) {
        if (usingFallback) {
            return NextResponse.json(
                { error: "Order update failed. Set SUPABASE_SERVICE_ROLE_KEY for full admin access." },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: logError } = await db
        .from("order_status_logs")
        .insert({
            order_id: orderId,
            old_status: existingOrder?.status || null,
            new_status: normalizedStatus,
            changed_by_user_id: auth.user.id,
            changed_by_email: auth.user.email || null,
        });

    if (logError) {
        console.error("Failed to write order status log:", logError);
    }

    return NextResponse.json({ success: true, status: normalizedStatus });
}
