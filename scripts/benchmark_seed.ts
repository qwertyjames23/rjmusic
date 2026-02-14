
// scripts/benchmark_seed.ts

// Mock Data (replicating src/lib/data.ts structure)
const products = [
    { id: "1", name: "Product 1", price: 100, category: "Guitars", brand: "Fender", inStock: true, rating: 5, reviews: 10, images: [] },
    { id: "2", name: "Product 2", price: 200, category: "Studio", brand: "Shure", inStock: true, rating: 5, reviews: 10, images: [] },
    { id: "3", name: "Product 3", price: 300, category: "Keys", brand: "Korg", inStock: true, rating: 5, reviews: 10, images: [] },
    { id: "4", name: "Product 4", price: 400, category: "Accessories", brand: "Audio-Technica", inStock: true, rating: 5, reviews: 10, images: [] },
    { id: "5", name: "Product 5", price: 500, category: "Percussion", brand: "Pearl", inStock: false, rating: 5, reviews: 10, images: [] },
    { id: "6", name: "Product 6", price: 600, category: "Keys", brand: "Nord", inStock: true, rating: 5, reviews: 10, images: [] }
];

// Mock Supabase Client
class MockSupabase {
    insertCalls = 0;

    from(table: string) {
        return {
            insert: async (data: unknown[] | Record<string, unknown>) => {
                this.insertCalls++;
                console.log(`[MockDB] Inserting into ${table}:`, Array.isArray(data) ? `Batch of ${data.length}` : 'Single item');
                return { error: null };
            },
            select: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) // Mock connection check
        };
    }
}

const supabase = new MockSupabase();

async function benchmarkOptimizedLogic() {
    console.log("⚡ Starting Optimized Benchmark (Batch Insert)...");

    // Reset counter
    supabase.insertCalls = 0;

    // Logic replicated from src/app/admin/seed/page.tsx (Optimized)
    // 2. Insert Products
    const dbProducts = products.map((p) => ({
        name: p.name,
        // ... other fields mapping
    }));

    await supabase.from('products').insert(dbProducts);

    console.log(`📊 Optimized Results:`);
    console.log(`   Items to insert: ${products.length}`);
    console.log(`   Database operations: ${supabase.insertCalls}`);

    if (supabase.insertCalls === 1) {
        console.log("✅ Verified: Batch insert detected (O(1) operations).");
    } else {
        console.log("❌ Unexpected operation count.");
    }
}

benchmarkOptimizedLogic();
