
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = 'http://localhost:3000'; // Make sure your server is running!

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function simulateWebhook() {
  console.log('--- Simulating PayMongo Webhook ---');

  // 1. Get a pending order
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!order) {
    console.error('❌ No pending orders found to test.');
    return;
  }

  console.log(`🎯 Targeting Order ID: ${order.id}`);

  // 2. Construct Mock Event
  const mockEvent = {
    data: {
      attributes: {
        type: 'checkout_session.payment.paid',
        data: {
          id: 'cs_test_123',
          attributes: {
            line_items: [
              { description: `Order #${order.id}` }
            ]
          }
        }
      }
    }
  };

  // 3. Send POST request to local API
  try {
    const response = await fetch(`${APP_URL}/api/webhooks/paymongo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockEvent)
    });

    const result = await response.json();
    console.log('📡 Webhook Response:', result);

    if (response.ok) {
        // 4. Verify DB Update
        console.log('⏳ Verifying DB update...');
        await new Promise(r => setTimeout(r, 2000)); // Wait for DB update

        const { data: updatedOrder } = await supabase
            .from('orders')
            .select('payment_status, status')
            .eq('id', order.id)
            .single();
        
        console.log(`✅ Order Updated:`);
        console.log(`   Payment: ${updatedOrder.payment_status} (Expected: paid)`);
        console.log(`   Status:  ${updatedOrder.status} (Expected: Processing)`);
    }

  } catch (err) {
    console.error('❌ Request Failed:', err.message);
    console.log('💡 Ensure your Next.js server is running on localhost:3000');
  }
}

simulateWebhook();
