import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to post a review.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.', details: parsed.error.flatten() }, { status: 400 });
    }

    const { product_id, rating, title, comment } = parsed.data;

    // Optional: Verify the user has purchased the product
    // Note: RLS can also enforce this, but a check here provides a better error message.
    const { data: purchased, error: purchaseError } = await supabase.rpc('has_purchased', {
      p_user_id: user.id,
      p_product_id: product_id,
    });

    if (purchaseError || !purchased) {
       return NextResponse.json({ error: 'You can only review products you have purchased and received.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: user.id,
        rating,
        title,
        comment,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (user already reviewed)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
