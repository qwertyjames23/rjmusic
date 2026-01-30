import { Product } from "@/types";

export const products: Product[] = [
    {
        id: "1",
        name: "Stratocaster Ultra",
        description: "The Stratocaster Ultra features a unique 'Modern D' neck profile with Ultra rolled fingerboard edges for hours of playing comfort, and the tapered neck heel allows easy access to the highest register. A speedy 10\"-14\" compound-radius fingerboard with 22 medium-jumbo frets means effortless and accurate soloing, while the Ultra Noiseless™ Vintage pickups and advanced wiring options provide endless tonal possibilities – without hum.",
        price: 106350.00,
        category: "Guitars",
        brand: "Fender",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCShBWHoyXynFzRx6jj2ENw3NnEjYHcDdYck0r1ojzWsoSbYQgsgkQb1O9rPQpHVgZ1kD70sZLVVEmr_nWierrNlhrCV2Jl2pMobXNcVytrj5cuXA39GnJatZajOC7cbuHtUrby9ZEbpiCfehNZyCrfwyxBjrxKDPH69cs5Mzznou4qVoqZuY0eLeXoGrTp-vDORNdaAkW34_8xkRxfUzvrqwbP-NvbxiWZM4NEA9i0IdxvLvvfbDq5cx7NgMFw61pz6VXGfCrkfkk"
        ],
        inStock: true,
        rating: 4.9,
        reviews: 128,
        tags: ["NEW"],
        features: [
            "Modern D neck profile",
            "Ultra Noiseless Vintage pickups",
            "Compound radius fingerboard"
        ]
    },
    {
        id: "2",
        name: "Studio Vocal Mic",
        description: "Professional dynamic vocal microphone. Includes a built-in pop filter and shock mount to reduce handling noise. Perfect for podcasting, streaming, and studio recording.",
        price: 22350.00,
        category: "Studio",
        brand: "Shure",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD9XnAl1l2UVBJVcXsqsXI7iswMvSokID__m1J6fyTJifp11txkPrbGSbF-B5XkZHE5rWaT06E1fjzEUd5lxY-XQto6H7tjj6sXJNLDbU-j2s3U9gCY6WTW7CeTrCoZQTYc8VYdiPEIH9IvXyTxWCWLZGR2D2aYTqapUaWJ1VZEM66wA1EMuBahpvWPiuZ6jWaOG0QHtv0ABUeCmpy0Zpmr2kykLzG5FWOYZxy8X-iyyQmMwlBjW_5kDc_i3vIVdbB9LVfKQAhH1-s"
        ],
        inStock: true,
        rating: 4.8,
        reviews: 85,
        features: [
            "Built-in pop filter",
            "Cardioid polar pattern",
            "Integrated shock mount"
        ]
    },
    {
        id: "3",
        name: "Analog Synth Pro",
        description: "A powerhouse 37-key analog synthesizer with dual VCOs, 3-way multi-mode VCF, and a 32-step sequencer. Create rich, evolving textures and classic leads.",
        price: 41950.00,
        originalPrice: 50350.00,
        category: "Keys",
        brand: "Korg",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBBMYeu1-xtAK9ATwz9ZHbHPD_BEilR_1np8SgN2llmG3MBi17qZWksmg3LLQoV9e3QELsdhmgkXUjQ2zDHrZUu6n2G6FR61SjbVJpvDyLo8HzDwqfs4ZaxJL3tgf6y52Qhzv04naqgJGnhvSw9KzL26lC0i82IcYw_5MJVdhxBidZo4yqkVkyRDqWKRzoxj45zRvFIbPIp8CdOfDJTYscECQG7PXiEt_P63g7cPQS8f6ECpc6s1iJ57Dr0QIjacnJSjoRfu2tY16Q"
        ],
        inStock: true,
        rating: 4.7,
        reviews: 42,
        tags: ["SALE"],
        features: [
            "37 full-size keys",
            "Dual VCOs",
            "32-step sequencer"
        ]
    },
    {
        id: "4",
        name: "Reference Headphones",
        description: "Closed-back studio reference headphones for monitoring and mixing. Delivers exceptional isolation and accurate sound reproduction across the entire frequency range.",
        price: 13950.00,
        category: "Accessories",
        brand: "Audio-Technica",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCpRYoSQc2gDdbbdjKVk-V7IrSvHpHKv8J-SNPQ4nP2gM6zMi8p4DxbcA4pXxDaCcpgIIUHxRjizdn9eZ1zhn4Nb1-sV5YIM8khiQFFpUGyKTYRw0_ZHoxkR5hQimrVxE9Yn7Shx47o3jYfMQbwdEVkfbhtQpoaE0RHYH7jEYqGimvEjgvuUp4hmACo6N2Z21li3VSCheVBj9ypLB4_mULH9Xlxyx_OGrqqR_UOhBCiFMi3gxIiMI5s7fdmWclcxmOwOQZFFryVmC8"
        ],
        inStock: true,
        rating: 4.6,
        reviews: 215,
        features: [
            "45mm large-aperture drivers",
            "90-degree swiveling earcups",
            "Detachable cables"
        ]
    },
    {
        id: "5",
        name: "Professional Drum Kit",
        description: "A complete 5-piece drum kit with cymbals and hardware. Features birch shells for a balanced, articulate sound with distinct high-end punch and low-end depth.",
        price: 85000.00,
        category: "Percussion",
        brand: "Pearl",
        images: ["https://placehold.co/600x400/101822/FFF?text=Drum+Kit"], // Placeholder
        inStock: false,
        rating: 5.0,
        reviews: 12,
        features: [
            "6-ply Birch shells",
            "Suspension mounting system",
            "Includes hardware pack"
        ]
    },
    {
        id: "6",
        name: "Grand Stage Piano",
        description: "88-key stage piano with weighted hammer action and premium grand piano sound engine. Perfect for live performances and studio work.",
        price: 185000.00,
        category: "Keys",
        brand: "Nord",
        images: ["https://placehold.co/600x400/101822/FFF?text=Stage+Piano"], // Placeholder
        inStock: true,
        rating: 4.9,
        reviews: 34,
        tags: ["BESTSELLER"],
        features: [
            "Triple Sensor keybed",
            "Advanced Layering",
            "Seamless transitions"
        ]
    }
];
