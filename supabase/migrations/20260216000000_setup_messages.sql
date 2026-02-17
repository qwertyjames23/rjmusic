-- Messages table for customer-admin chat
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_admin BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations table to group messages per customer
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_email TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id)
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Customers can read their own messages
CREATE POLICY "customers_read_own_messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND c.customer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Customers can insert messages to their own conversation
CREATE POLICY "customers_insert_messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND (
            EXISTS (
                SELECT 1 FROM conversations c
                WHERE c.id = messages.conversation_id
                AND c.customer_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid() AND p.role = 'admin'
            )
        )
    );

-- Conversations: customers see their own, admins see all
CREATE POLICY "customers_read_own_conversations" ON conversations
    FOR SELECT USING (
        customer_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Customers can create their own conversation
CREATE POLICY "customers_create_conversation" ON conversations
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Admin can update conversations (mark read, etc.)
CREATE POLICY "admin_update_conversations" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Admin can update messages (mark read)
CREATE POLICY "admin_update_messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Customer can update their own messages (mark read for admin replies)
CREATE POLICY "customers_update_own_messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND c.customer_id = auth.uid()
        )
    );
