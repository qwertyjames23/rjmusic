
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Attempt to load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isRealEnv = !!(supabaseUrl && supabaseKey);

// Mock data for simulation
const MOCK_COUNT = 5000;
const mockData = Array.from({ length: MOCK_COUNT }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
}));

async function benchmark() {
    console.log("🚀 Starting Benchmark: Homepage Trending Products Query");
    console.log("-----------------------------------------------------");

    if (isRealEnv) {
        console.log("✅ Real Supabase environment detected.");
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        // --- BASELINE ---
        console.log("\nMEASURING BASELINE (Fetch All + Client Slice)...");
        const startBase = performance.now();
        const { data: allData, error: baseError } = await supabase.from('products').select('*');
        if (baseError) throw baseError;
        const trendingBase = allData.slice(0, 4);
        const endBase = performance.now();
        console.log(`   Time: ${(endBase - startBase).toFixed(2)}ms`);
        console.log(`   Rows Fetched: ${allData.length}`);
        console.log(`   Final Rows Used: ${trendingBase.length}`);

        // --- OPTIMIZED ---
        console.log("\nMEASURING OPTIMIZED (Order + Limit)...");
        const startOpt = performance.now();
        const { data: optData, error: optError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4);
        if (optError) throw optError;
        const endOpt = performance.now();
        console.log(`   Time: ${(endOpt - startOpt).toFixed(2)}ms`);
        console.log(`   Rows Fetched: ${optData.length}`);

        console.log("\n-----------------------------------------------------");
        console.log(`🎉 Improvement: ${(endBase - startBase).toFixed(2)}ms -> ${(endOpt - startOpt).toFixed(2)}ms`);

    } else {
        console.warn("⚠️  Missing Supabase credentials. Running SIMULATION instead.");

        // Simulation
        const simulateDelay = (itemCount: number) => new Promise(r => setTimeout(r, 50 + (itemCount * 0.1))); // 50ms latency + 0.1ms per row

        // --- BASELINE SIMULATION ---
        console.log("\n[SIMULATION] MEASURING BASELINE (Fetch All + Client Slice)...");
        const startBase = performance.now();
        await simulateDelay(MOCK_COUNT); // Simulate fetching 5000 rows
        const allData = [...mockData];
        const trendingBase = allData.slice(0, 4);
        const endBase = performance.now();
        console.log(`   Time: ${(endBase - startBase).toFixed(2)}ms (Simulated download of ${MOCK_COUNT} rows)`);

        // --- OPTIMIZED SIMULATION ---
        console.log("\n[SIMULATION] MEASURING OPTIMIZED (Order + Limit)...");
        const startOpt = performance.now();
        await simulateDelay(4); // Simulate fetching 4 rows
        const optData = mockData.slice(0, 4);
        const endOpt = performance.now();
        console.log(`   Time: ${(endOpt - startOpt).toFixed(2)}ms (Simulated download of 4 rows)`);

        console.log("\n-----------------------------------------------------");
        console.log(`🎉 Simulated Improvement: ${(endBase - startBase).toFixed(2)}ms -> ${(endOpt - startOpt).toFixed(2)}ms`);
    }
}

benchmark().catch(console.error);
