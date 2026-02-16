
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Connection string for Supabase
// Format: postgres://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:5432/postgres
const connectionString = `postgres://postgres.ytgwjbmmnkhcvrmaxrvs:8246578Rja!@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`;

const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260215000002_checkout_standardization.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function applyRpc() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connections
    }
  });

  try {
    console.log('--- Connecting to Supabase Database ---');
    await client.connect();
    console.log('✅ Connected successfully.');

    console.log('Applying place_order RPC...');
    await client.query(sql);
    console.log('✅ Success! The place_order RPC has been applied to the database.');

    // Also reload the schema cache just in case
    console.log('Reloading PostgREST schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('✅ Schema cache reload notification sent.');

  } catch (err) {
    console.error('❌ Error applying RPC:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
  } finally {
    await client.end();
    console.log('--- Connection Closed ---');
  }
}

applyRpc();
