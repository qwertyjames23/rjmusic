import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            message: 'Build time check or missing credentials: skipping seed.'
        }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('products').insert({
        name: 'Test DB Guitar',
        description: 'Test Description',
        price: 9999,
        category: 'Guitars',
        brand: 'TestBrand',
        images: ['https://placehold.co/600x400/png'],
        in_stock: true
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true });
}
