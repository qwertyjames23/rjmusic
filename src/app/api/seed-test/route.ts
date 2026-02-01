import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
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
