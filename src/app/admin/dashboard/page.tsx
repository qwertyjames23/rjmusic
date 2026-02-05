import { createClient } from "@/utils/supabase/server";
import DashboardContent from "./_components/DashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch Stats
    const { count: orderCount, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    // Use 'total' if available, fallback logic handled
    const { data: revenueData } = await supabase
        .from('orders')
        .select('total');

    const totalRevenue = revenueData?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;

    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // Fetch Recent Orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    const initialStats = {
        revenue: totalRevenue,
        orders: orderCount || 0,
        products: productCount || 0
    };

    return (
        <DashboardContent
            initialStats={initialStats}
            initialRecentOrders={recentOrders || []}
        />
    );
}
