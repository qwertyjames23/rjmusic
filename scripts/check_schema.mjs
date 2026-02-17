import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function check() {
    // Use information_schema to check columns
    const { data: convoCols, error: e1 } = await supabase
        .rpc('get_table_columns', { table_name: 'conversations' })
        .select('*');

    // Fallback: just try inserting with minimal fields
    console.log("=== Test minimal conversation insert ===");
    const { data: t1, error: err1 } = await supabase
        .from("conversations")
        .insert({ customer_id: "8d3dae96-936f-48a1-b081-1b78aed5311d" })
        .select("*")
        .single();
    console.log("Data:", JSON.stringify(t1, null, 2));
    console.log("Error:", err1);

    if (t1) {
        console.log("\n=== Conversation columns ===");
        console.log(Object.keys(t1));

        // Test message insert
        console.log("\n=== Test minimal message insert ===");
        const { data: t2, error: err2 } = await supabase
            .from("messages")
            .insert({
                conversation_id: t1.id,
                sender_id: "8d3dae96-936f-48a1-b081-1b78aed5311d",
                content: "test"
            })
            .select("*")
            .single();
        console.log("Data:", JSON.stringify(t2, null, 2));
        console.log("Error:", err2);

        if (t2) {
            console.log("\n=== Message columns ===");
            console.log(Object.keys(t2));
            await supabase.from("messages").delete().eq("id", t2.id);
        }

        await supabase.from("conversations").delete().eq("id", t1.id);
        console.log("\n✅ Cleanup done");
    }
}

check().catch(console.error);
