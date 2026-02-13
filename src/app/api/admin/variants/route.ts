import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = req.nextUrl.searchParams.get("product_id");
    if (!productId) {
        return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variants: data });
}

export async function POST(req: NextRequest) {
    // Verify admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("[variants POST] Auth check:", { userEmail: user?.email, authError: authError?.message, adminEmail: process.env.ADMIN_EMAIL });

    if (authError || !user || user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized - please log out and log back in" }, { status: 401 });
    }

    const body = await req.json();
    const { product_id, label, price, stock, image_url, sort_order, variant_type } = body;

    if (!product_id || !label || price === undefined) {
        return NextResponse.json({ error: "product_id, label, and price are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Insert variant — build object dynamically to handle optional columns
    const insertData: Record<string, unknown> = {
        product_id,
        label,
        price: Number(price),
        stock: Number(stock || 0),
        image_url: image_url || null,
        sort_order: sort_order || 0,
    };
    // Only include variant_type if provided (avoids error if column doesn't exist yet)
    if (variant_type) insertData.variant_type = variant_type;

    const { data, error } = await adminClient
        .from("product_variants")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update product has_variants flag
    await adminClient
        .from("products")
        .update({ has_variants: true })
        .eq("id", product_id);

    return NextResponse.json({ variant: data });
}

export async function PUT(req: NextRequest) {
    // Verify admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, label, price, stock, image_url, sort_order, is_active, variant_type } = body;

    if (!id) {
        return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;
    // Only include variant_type if explicitly provided with a value (avoids error if column doesn't exist yet)
    if (variant_type) updateData.variant_type = variant_type;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await adminClient
        .from("product_variants")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variant: data });
}

export async function DELETE(req: NextRequest) {
    // Verify admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const variantId = req.nextUrl.searchParams.get("id");
    const productId = req.nextUrl.searchParams.get("product_id");

    if (!variantId) {
        return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
        .from("product_variants")
        .delete()
        .eq("id", variantId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check remaining variants — if none, set has_variants to false
    if (productId) {
        const { data: remaining } = await adminClient
            .from("product_variants")
            .select("id")
            .eq("product_id", productId);

        if (!remaining || remaining.length === 0) {
            await adminClient
                .from("products")
                .update({ has_variants: false })
                .eq("id", productId);
        }
    }

    return NextResponse.json({ success: true });
}
