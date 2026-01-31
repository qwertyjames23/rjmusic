"use client";

import { Ticket, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function VouchersPage() {
    const vouchers = [
        {
            id: 1,
            code: "WELCOME10",
            discount: "10% OFF",
            description: "New user discount, no min. spend",
            expiry: "Expires Dec 31, 2026",
            used: false,
        },
        {
            id: 2,
            code: "FREESHIP",
            discount: "Free Shipping",
            description: "Min. spend ₱2,000",
            expiry: "Expires Nov 30, 2026",
            used: false,
        },
        {
            id: 3,
            code: "GIBSON500",
            discount: "₱500 OFF",
            description: "On any Gibson guitar purchase",
            expiry: "Used Oct 24, 2026",
            used: true,
        }
    ];

    const [copied, setCopied] = useState<number | null>(null);

    const handleCopy = (id: number, code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">My Vouchers</h2>
                    <p className="text-muted-foreground text-sm mt-1">Available discounts and coupons</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter voucher code"
                        className="bg-secondary/50 border border-input rounded-lg pl-4 pr-24 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
                    />
                    <button className="absolute right-1 top-1 bottom-1 bg-primary text-primary-foreground text-xs font-bold px-4 rounded-md hover:bg-primary/90 transition-colors">
                        Redeem
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {vouchers.map((voucher) => (
                    <div
                        key={voucher.id}
                        className={`relative border rounded-xl overflow-hidden flex ${voucher.used ? 'border-border opacity-60 bg-secondary/20' : 'border-primary/30 bg-primary/5'}`}
                    >
                        <div className={`w-32 flex flex-col items-center justify-center border-r border-dashed ${voucher.used ? 'border-border bg-secondary/30' : 'border-primary/30 bg-primary/10'}`}>
                            <Ticket className={`size-8 mb-2 ${voucher.used ? 'text-muted-foreground' : 'text-primary'}`} />
                            <span className={`font-black text-lg ${voucher.used ? 'text-muted-foreground' : 'text-primary'}`}>{voucher.discount}</span>
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-sm tracking-wide">{voucher.code}</h3>
                                    {!voucher.used && (
                                        <button
                                            onClick={() => handleCopy(voucher.id, voucher.code)}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {copied === voucher.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{voucher.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{voucher.expiry}</span>
                                {voucher.used ? (
                                    <span className="text-[10px] font-bold bg-secondary text-muted-foreground px-2 py-1 rounded">USED</span>
                                ) : (
                                    <button className="text-[10px] font-bold text-primary hover:underline">Use Now</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
