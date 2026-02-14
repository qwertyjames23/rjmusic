import { createClient } from "@/utils/supabase/server";
import DashboardContent from "./_components/DashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch Stats
    const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    const { data: revenueData } = await supabase
        .from('orders')
        .select('total');

    const totalRevenue = revenueData?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;

    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // Fetch Recent Orders (Full details)
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch Last 7 Days Orders for Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: chartOrdersData } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    // Process Chart Data
    const chartDataMap = new Map<string, number>();

    // Initialize last 7 days with 0 to ensure continuity
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., Mon, Tue
        chartDataMap.set(key, 0);
    }

    // Fill with actual data
    chartOrdersData?.forEach(order => {
        const d = new Date(order.created_at);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        // Only update if it falls within our generated keys (handles potential timezone edge cases slightly simpler)
        // Actually, relying on the loop keys is safer for ordering.
        // Let's iterate the map keys? No, Map preserves insertion order.
        if (chartDataMap.has(key)) {
            chartDataMap.set(key, (chartDataMap.get(key) || 0) + order.total);
        }
    });

    const chartData = Array.from(chartDataMap).map(([name, total]) => ({ name, total }));

    const initialStats = {
        revenue: totalRevenue,
        orders: orderCount || 0,
        products: productCount || 0
    };

    return (
        <DashboardContent
            initialStats={initialStats}
            initialRecentOrders={recentOrders || []}
            initialChartData={chartData}
        />
    );
}
