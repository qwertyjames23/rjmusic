
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: This script will fail unless run with a service role key OR as an Admin user
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const products = [
  {
    name: 'Stratocaster Ultra',
    description: 'The Stratocaster Ultra features a unique Modern D neck profile with Ultra rolled fingerboard edges for hours of playing comfort.',
    price: 106350.00,
    category: 'Guitars',
    brand: 'Fender',
    images: ['https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=1974&auto=format&fit=crop'],
    in_stock: true,
    rating: 4.9,
    reviews: 128,
    tags: ['NEW'],
    features: ['Modern D neck profile', 'Ultra Noiseless Vintage pickups', 'Compound radius fingerboard']
  },
  {
    name: 'Studio Vocal Mic',
    description: 'Professional dynamic vocal microphone. Includes a built-in pop filter and shock mount to reduce handling noise.',
    price: 22350.00,
    category: 'Studio',
    brand: 'Shure',
    images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1974&auto=format&fit=crop'],
    in_stock: true,
    rating: 4.8,
    reviews: 85,
    tags: [],
    features: ['Built-in pop filter', 'Cardioid polar pattern', 'Integrated shock mount']
  },
  {
    name: 'Analog Synth Pro',
    description: 'A powerhouse 37-key analog synthesizer with dual VCOs, 3-way multi-mode VCF, and a 32-step sequencer.',
    price: 41950.00,
    original_price: 50350.00,
    category: 'Keys',
    brand: 'Korg',
    images: ['https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop'],
    in_stock: true,
    rating: 4.7,
    reviews: 42,
    tags: ['SALE'],
    features: ['37 full-size keys', 'Dual VCOs', '32-step sequencer']
  },
  {
    name: 'Reference Headphones',
    description: 'Closed-back studio reference headphones for monitoring and mixing. Delivers exceptional isolation.',
    price: 13950.00,
    category: 'Accessories',
    brand: 'Audio-Technica',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'],
    in_stock: true,
    rating: 4.6,
    reviews: 215,
    tags: [],
    features: ['45mm large-aperture drivers', '90-degree swiveling earcups', 'Detachable cables']
  }
];

async function seed() {
  console.log('--- Starting Database Seed ---');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env.local. Attempting with anon key (will fail if RLS is enabled).');
  }

  // 1. Clear existing products (optional, but good for determinism)
  console.log('Cleaning up existing products...');
  const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('❌ Cleanup failed:', deleteError.message);
    if (deleteError.message.includes('row-level security')) {
      console.log('💡 Note: You need admin/service_role permissions to delete products.');
    }
  } else {
    console.log('✅ Cleanup successful.');
  }

  // 2. Insert products
  console.log(`Inserting ${products.length} products...`);
  const { data, error } = await supabase.from('products').insert(products).select();

  if (error) {
    console.error('❌ Seed failed:', error.message);
  } else {
    console.log(`✅ Seed successful! Inserted ${data.length} items.`);
  }

  console.log('--- Seed Complete ---');
}

seed();
