import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || user.email !== process.env.ADMIN_EMAIL) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), supabase };
    }

    return { supabase };
}

function getDbClientOrFallback(fallbackClient: Awaited<ReturnType<typeof createClient>>) {
    try {
        return { db: createAdminClient(), usingFallback: false };
    } catch {
        return { db: fallbackClient, usingFallback: true };
    }
}

function isSchemaMissingError(error: { code?: string; message?: string } | null) {
    if (!error) return false;
    if (error.code === "42P01" || error.code === "42703") return true;
    return /does not exist|column .* does not exist/i.test(error.message || "");
}

async function syncProductFromVariants(
    db: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>,
    productId: string
) {
    const { data: variants, error } = await db
        .from("product_variants")
        .select("price, stock, is_active")
        .eq("product_id", productId);

    if (error || !variants) return;

    const activeVariants = variants.filter(v => v.is_active !== false);
    const hasAny = activeVariants.length > 0;
    const totalStock = activeVariants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    const minPrice = hasAny ? Math.min(...activeVariants.map(v => Number(v.price || 0))) : 0;

    await db
        .from("products")
        .update({
            has_variants: hasAny,
            price: minPrice,
            stock: totalStock,
            in_stock: totalStock > 0,
        })
        .eq("id", productId);
}

export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.errorResponse) return auth.errorResponse;

    const productId = req.nextUrl.searchParams.get("product_id");
    if (!productId) {
        return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const { db, usingFallback } = getDbClientOrFallback(auth.supabase);
    const { data, error } = await db
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

    if (error) {
        if (isSchemaMissingError(error)) {
            return NextResponse.json({ variants: [], warning: "Variants schema not initialized yet" });
        }
        if (usingFallback) {
            return NextResponse.json(
                { error: "Variants read failed. Set SUPABASE_SERVICE_ROLE_KEY for full admin access." },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variants: data });
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const { product_id, label, price, stock, image_url, sort_order, variant_type } = body;

    if (!product_id || !label || price === undefined) {
        return NextResponse.json({ error: "product_id, label, and price are required" }, { status: 400 });
    }

    const { db, usingFallback } = getDbClientOrFallback(auth.supabase);

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

    const { data, error } = await db
        .from("product_variants")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        if (isSchemaMissingError(error)) {
            return NextResponse.json({ error: "Variants table is not initialized yet" }, { status: 503 });
        }
        if (usingFallback) {
            return NextResponse.json(
                { error: "Variant create failed. Set SUPABASE_SERVICE_ROLE_KEY for full admin access." },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await syncProductFromVariants(db, product_id);

    return NextResponse.json({ variant: data });
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const { id, label, price, stock, image_url, sort_order, is_active, variant_type } = body;

    if (!id) {
        return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    const { db, usingFallback } = getDbClientOrFallback(auth.supabase);

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

    const { data, error } = await db
        .from("product_variants")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        if (isSchemaMissingError(error)) {
            return NextResponse.json({ error: "Variants table is not initialized yet" }, { status: 503 });
        }
        if (usingFallback) {
            return NextResponse.json(
                { error: "Variant update failed. Set SUPABASE_SERVICE_ROLE_KEY for full admin access." },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await syncProductFromVariants(db, data.product_id);

    return NextResponse.json({ variant: data });
}

export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.errorResponse) return auth.errorResponse;

    const variantId = req.nextUrl.searchParams.get("id");
    const productId = req.nextUrl.searchParams.get("product_id");

    if (!variantId) {
        return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    const { db, usingFallback } = getDbClientOrFallback(auth.supabase);

    const { error } = await db
        .from("product_variants")
        .delete()
        .eq("id", variantId);

    if (error) {
        if (isSchemaMissingError(error)) {
            return NextResponse.json({ error: "Variants table is not initialized yet" }, { status: 503 });
        }
        if (usingFallback) {
            return NextResponse.json(
                { error: "Variant delete failed. Set SUPABASE_SERVICE_ROLE_KEY for full admin access." },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check remaining variants — if none, set has_variants to false
    if (productId) {
        const { data: remaining } = await db
            .from("product_variants")
            .select("id")
            .eq("product_id", productId);

        if (!remaining || remaining.length === 0) {
            await db
                .from("products")
                .update({ has_variants: false, stock: 0, in_stock: false, price: 0 })
                .eq("id", productId);
        } else {
            await syncProductFromVariants(db, productId);
        }
    }

    return NextResponse.json({ success: true });
}
