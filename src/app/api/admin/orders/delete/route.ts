import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function DELETE(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { order_ids } = await req.json();

        if (!Array.isArray(order_ids) || order_ids.length === 0) {
            return NextResponse.json({ error: "No order IDs provided" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Delete order items first (foreign key constraint)
        const { error: itemsError } = await supabase
            .from("order_items")
            .delete()
            .in("order_id", order_ids);

        if (itemsError) {
            console.error("Failed to delete order items:", itemsError);
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }

        // Delete status logs if they exist
        await supabase
            .from("order_status_logs")
            .delete()
            .in("order_id", order_ids);

        // Delete the orders
        const { error: ordersError } = await supabase
            .from("orders")
            .delete()
            .in("id", order_ids);

        if (ordersError) {
            console.error("Failed to delete orders:", ordersError);
            return NextResponse.json({ error: ordersError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, deleted: order_ids.length });
    } catch (error: unknown) {
        console.error("Order delete error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }
}
