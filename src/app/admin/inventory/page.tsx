import { createClient } from "@/utils/supabase/server";
import { InventoryTable } from "./InventoryTable";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
    const supabase = await createClient();
    
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <p className="text-gray-400">Manage product stock levels and availability.</p>
            </div>
            <InventoryTable initialProducts={products || []} />
        </div>
    );
}