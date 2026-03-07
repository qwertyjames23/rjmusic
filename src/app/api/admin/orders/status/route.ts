import { NextRequest, NextResponse } from "next/server";
import { createClient, isAdmin } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { z } from "zod";

const ALLOWED_ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

const updateStatusSchema = z.object({
    order_id: z.string().uuid("Invalid order ID format"),
    status: z.enum(ALLOWED_ORDER_STATUSES),
});

async function requireAdmin() {
    if (!(await isAdmin())) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return { supabase, user: user! };
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

    try {
        const body = await req.json();
        const validation = updateStatusSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { order_id: orderId, status: normalizedStatus } = validation.data;

        const { db, usingFallback } = getDbClientOrFallback(auth.supabase);

        // Fetch current order status, items, and messenger sender id
        const { data: existingOrder, error: existingOrderError } = await db
            .from("orders")
            .select("status, order_items(product_id, quantity)")
            .eq("id", orderId)
            .single();

        if (existingOrderError) {
            return NextResponse.json({ error: existingOrderError.message }, { status: 500 });
        }

        const oldStatus = existingOrder?.status || "";
        const STOCK_DEDUCTED_STATUSES = ["Processing", "Shipped", "Delivered"];

        // Update order status
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

        // Stock management
        const items = (existingOrder?.order_items as { product_id: string; quantity: number }[]) || [];
        const wasStockDeducted = STOCK_DEDUCTED_STATUSES.includes(oldStatus);
        const shouldDeductNow = normalizedStatus === "Processing" && !wasStockDeducted;
        const shouldRestoreNow = normalizedStatus === "Cancelled" && wasStockDeducted;

        if ((shouldDeductNow || shouldRestoreNow) && items.length > 0) {
            const stockDelta = shouldDeductNow ? -1 : 1;
            for (const item of items) {
                if (!item.product_id) continue;
                await db.rpc("adjust_product_stock", {
                    p_product_id: item.product_id,
                    p_delta: stockDelta * item.quantity,
                });
            }
        }

        // Messenger notification is handled by the bot via Supabase Realtime

        const { error: logError } = await db
            .from("order_status_logs")
            .insert({
                order_id: orderId,
                old_status: oldStatus || null,
                new_status: normalizedStatus,
                changed_by_user_id: auth.user.id,
                changed_by_email: auth.user.email || null,
            });

        if (logError) {
            console.error("Failed to write order status log:", logError);
        }

        return NextResponse.json({ success: true, status: normalizedStatus });
    } catch (error: unknown) {
        console.error("Order status update error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }
}
