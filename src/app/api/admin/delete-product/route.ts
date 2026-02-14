import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        // Use the regular server client to verify the user's identity
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (user.email !== adminEmail) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { productIds } = body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ error: "productIds is required" }, { status: 400 });
        }

        // Use admin client (service role) to bypass RLS for cascading deletes
        let adminSupabase;
        try {
            adminSupabase = createAdminClient();
        } catch {
            return NextResponse.json(
                { error: "SUPABASE_SERVICE_ROLE_KEY is required for admin delete operations" },
                { status: 503 }
            );
        }

        // Delete related reviews first (bypasses RLS)
        const { error: reviewsError } = await adminSupabase
            .from("reviews")
            .delete()
            .in("product_id", productIds);

        if (reviewsError) {
            console.warn("Error deleting related reviews:", reviewsError);
        }

        // Delete related cart items (bypasses RLS)
        const { error: cartError } = await adminSupabase
            .from("cart_items")
            .delete()
            .in("product_id", productIds);

        if (cartError) {
            console.warn("Error deleting related cart items:", cartError);
        }

        // Now delete the product(s) (bypasses RLS)
        const { error: productError } = await adminSupabase
            .from("products")
            .delete()
            .in("id", productIds);

        if (productError) {
            console.error("Error deleting product(s):", productError);
            return NextResponse.json(
                { error: productError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${productIds.length} product(s) deleted successfully`,
        });
    } catch (error: unknown) {
        console.error("Delete product error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
