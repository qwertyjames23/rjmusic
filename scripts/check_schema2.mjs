import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function check() {
    // Try select * with no filter to see column names
    const { data: c1, error: e1 } = await supabase.from("conversations").select("*").limit(0);
    console.log("conversations select:", { data: c1, error: e1?.message });

    const { data: m1, error: e2 } = await supabase.from("messages").select("*").limit(0);
    console.log("messages select:", { data: m1, error: e2?.message });

    // Try to get the schema via a raw insert with garbage to see what columns are expected
    const { error: e3 } = await supabase.from("conversations").insert({ _probe: true });
    console.log("conversations probe:", e3?.message, e3?.details);

    const { error: e4 } = await supabase.from("messages").insert({ _probe: true });
    console.log("messages probe:", e4?.message, e4?.details);
}

check().catch(console.error);
