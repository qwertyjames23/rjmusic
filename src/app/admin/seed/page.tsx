"use client";

import { useState } from "react";
import { products } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function SeedPage() {
    const [status, setStatus] = useState("Idle");
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const handleSeed = async () => {
        setStatus("Seeding...");
        addLog("Starting seed process...");

        try {
            // 1. Check connection
            const { data: test, error: testError } = await supabase.from('products').select('count').limit(1);
            if (testError) {
                // If error is 404/relation does not exist, table is missing
                throw new Error(`Connection failed: ${testError.message}. Did you run the SQL setup?`);
            }

            addLog("Connected to Supabase. Uploading products...");

            // 2. Insert Products
            for (const p of products) {
                const dbProduct = {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    original_price: p.originalPrice || null,
                    category: p.category,
                    brand: p.brand,
                    images: p.images,
                    in_stock: p.inStock,
                    rating: p.rating,
                    reviews: p.reviews,
                    tags: p.tags || [],
                    features: p.features || []
                };

                const { error } = await supabase.from('products').insert(dbProduct);

                if (error) {
                    addLog(`❌ Failed to insert ${p.name}: ${error.message}`);
                } else {
                    addLog(`✅ Inserted: ${p.name}`);
                }
            }

            addLog("Done!");
            setStatus("Complete");

        } catch (err: any) {
            addLog(`Error: ${err.message}`);
            setStatus("Error");
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <p className="mb-4 text-muted-foreground">
                This utility will upload the local mock data from <code>data.ts</code> to your Supabase <code>products</code> table.
            </p>

            <button
                onClick={handleSeed}
                disabled={status === "Seeding..."}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold disabled:opacity-50"
            >
                {status === "Seeding..." ? "Seeding..." : "Start Seeding"}
            </button>

            <div className="mt-8 bg-black/10 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
                {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
}
