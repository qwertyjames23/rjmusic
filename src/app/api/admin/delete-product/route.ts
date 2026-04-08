import { createClient, isAdmin } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deleteSchema = z.object({
    productIds: z.array(z.string().uuid()).min(1, "At least one product ID is required"),
});

export async function DELETE(request: NextRequest) {
    try {
        // Verify the user is an admin using our new helper
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = deleteSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { productIds } = validation.data;
        const supabase = await createClient();

        // Prefer service-role client; fallback to authenticated admin session client.
        // This allows delete to work in dev even when SERVICE_ROLE is not configured.
        const db = (() => {
            try {
                return createAdminClient();
            } catch {
                return supabase;
            }
        })();

        // Delete related reviews first (bypasses RLS)
        const { error: reviewsError } = await db
            .from("reviews")
            .delete()
            .in("product_id", productIds);

        if (reviewsError) {
            console.warn("Error deleting related reviews:", reviewsError);
        }

        // Delete related cart items (bypasses RLS)
        const { error: cartError } = await db
            .from("cart_items")
            .delete()
            .in("product_id", productIds);

        if (cartError) {
            console.warn("Error deleting related cart items:", cartError);
        }

        // Now delete the product(s) (bypasses RLS)
        const { error: productError } = await db
            .from("products")
            .delete()
            .in("id", productIds);

        if (productError) {
            console.error("Error deleting product(s):", productError);
            if (productError.code === "42501") {
                return NextResponse.json(
                    { error: "Delete blocked by RLS. Add SUPABASE_SERVICE_ROLE_KEY or grant admin role in profiles." },
                    { status: 403 }
                );
            }
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
