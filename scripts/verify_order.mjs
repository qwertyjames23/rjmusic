import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('❌ Service Role Key missing!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyLatestOrder() {
  console.log('--- Verifying Latest Order ---');

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (orderError) {
    console.error('❌ Error fetching latest order:', orderError.message);
    return;
  }

  console.log('✅ Latest Order Found:');
  console.log('   ID:', order.id);
  console.log('   Customer:', order.shipping_name || order.customer_name || 'N/A');
  console.log('   Total:', order.total);
  console.log('   Status:', order.status);
  console.log('   Idempotency Key:', order.idempotency_key);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError) {
    console.error('❌ Error fetching order items:', itemsError.message);
  } else {
    console.log(`✅ Found ${items?.length || 0} item(s)`);
  }

  console.log('--- Verification Complete ---');
}

verifyLatestOrder();
