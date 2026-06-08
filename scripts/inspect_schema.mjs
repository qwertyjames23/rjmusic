
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('❌ Missing SUPABASE_DB_URL in .env.local');
  process.exit(1);
}

async function inspectSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- Orders Table Schema ---');
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY column_name;
    `);
    
    res.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

inspectSchema();
