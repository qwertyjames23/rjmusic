import { createClient } from "@/utils/supabase/server";
import { OrdersTable } from "./_components/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const supabase = await createClient();
    
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            id, order_number, shipping_name, shipping_phone,
            shipping_address_line1, shipping_address_line2,
            shipping_city, shipping_state, shipping_postal_code,
            payment_method, total, status, payment_status,
            created_at, notes,
            order_items (*)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return <div className="p-8 text-red-500">Error loading orders. Please try again later.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-gray-400">Manage customer orders and track shipments.</p>
            </div>
            <OrdersTable initialOrders={orders || []} />
        </div>
    );
}