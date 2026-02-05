import { createClient } from "@/utils/supabase/server";
import CategoriesClient from "./_components/CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    const supabase = await createClient();
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-lg">
                    <h3 className="font-bold text-xl text-red-500 mb-2">Setup Required</h3>
                    <p className="text-gray-400 mb-4">
                        The <code>categories</code> table seems to be missing in your database.
                    </p>
                    <div className="bg-[#111827] p-4 rounded-lg overflow-auto text-xs font-mono text-left mb-6 border border-gray-700">
                        {error.message}
                    </div>

                    <p className="text-sm text-gray-500">
                        Please run the setup script located at:
                        <br />
                        <span className="text-blue-400 font-mono">.system/sql/create_categories_table.sql</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-white tracking-tight">Categories</h1>
                <p className="text-gray-400 mt-1">Manage product categories and collections.</p>
            </div>

            <CategoriesClient initialCategories={categories || []} />
        </div>
    );
}
