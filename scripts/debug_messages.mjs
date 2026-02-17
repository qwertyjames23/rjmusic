import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function debug() {
    // 1. Check conversations table structure
    console.log("=== Conversations Table ===");
    const { data: convos, error: convosErr } = await supabase
        .from("conversations")
        .select("*")
        .limit(5);
    console.log("Data:", convos);
    console.log("Error:", convosErr);

    // 2. Check messages table structure
    console.log("\n=== Messages Table ===");
    const { data: msgs, error: msgsErr } = await supabase
        .from("messages")
        .select("*")
        .limit(5);
    console.log("Data:", msgs);
    console.log("Error:", msgsErr);

    // 3. Try inserting a test conversation
    console.log("\n=== Test Insert Conversation ===");
    const { data: testConvo, error: testConvoErr } = await supabase
        .from("conversations")
        .insert({
            customer_id: "8d3dae96-936f-48a1-b081-1b78aed5311d",
            customer_name: "Test",
            customer_email: "test@test.com",
            last_message: "test",
            last_message_at: new Date().toISOString(),
            unread_count: 0,
        })
        .select("id")
        .single();
    console.log("Data:", testConvo);
    console.log("Error:", testConvoErr);

    if (testConvo) {
        // 4. Try inserting a test message
        console.log("\n=== Test Insert Message ===");
        const { data: testMsg, error: testMsgErr } = await supabase
            .from("messages")
            .insert({
                conversation_id: testConvo.id,
                sender_id: "8d3dae96-936f-48a1-b081-1b78aed5311d",
                content: "Hello test",
                is_from_admin: false,
                is_read: false,
            })
            .select("*")
            .single();
        console.log("Data:", testMsg);
        console.log("Error:", testMsgErr);

        // Cleanup
        await supabase.from("messages").delete().eq("conversation_id", testConvo.id);
        await supabase.from("conversations").delete().eq("id", testConvo.id);
        console.log("\n✅ Cleanup done");
    }
}

debug().catch(console.error);
