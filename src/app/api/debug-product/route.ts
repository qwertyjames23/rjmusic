
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    // Check specific ID
    let specificResult = null;
    if (id) {
        specificResult = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
    }

    // Check ANY products (limit 5)
    const listResult = await supabase
        .from('products')
        .select('id, name, stock, in_stock')
        .limit(5);

    return NextResponse.json({
        requestedId: id,
        specificFound: !!specificResult?.data,
        specificError: specificResult?.error,

        anyProductsFound: listResult.data?.length,
        firstFewProducts: listResult.data,
        listError: listResult.error,

        envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"
    });
}
