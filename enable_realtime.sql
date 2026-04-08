-- Enable Realtime for Orders table
-- This allows clients to subscribe to changes (INSERT, UPDATE, DELETE)

-- Check if publication exists, if not create it (supabase_realtime is usually default)
-- But we need to add the table to the publication.

alter publication supabase_realtime add table orders;

-- Verify
select * from pg_publication_tables where pubname = 'supabase_realtime';
