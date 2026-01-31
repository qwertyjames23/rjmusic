"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export default function AddressesPage() {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: "Alexander Rivers",
            phone: "(+63) 912 345 6789",
            address: "128 Synth Avenue, Studio B",
            city: "Makati City",
            region: "Metro Manila",
            postal: "1200",
            isDefault: true,
            label: "Home"
        },
        {
            id: 2,
            name: "Alex Rivera",
            phone: "(+63) 998 765 4321",
            address: "Unit 404, The Sound Garden, 5th Ave",
            city: "Taguig City",
            region: "Metro Manila",
            postal: "1630",
            isDefault: false,
            label: "Work"
        }
    ]);

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">My Addresses</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage your shipping addresses for checkout.</p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                    <Plus className="size-4" /> Add New Address
                </button>
            </div>

            <div className="divide-y divide-border">
                {addresses.map((addr) => (
                    <div key={addr.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-base">{addr.name}</span>
                                <span className="w-px h-4 bg-border"></span>
                                <span className="text-muted-foreground text-sm">{addr.phone}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{addr.address}</p>
                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.region}, {addr.postal}</p>
                            <div className="flex gap-2 mt-3">
                                {addr.isDefault && (
                                    <span className="px-2 py-0.5 border border-primary text-primary text-[10px] font-bold rounded">Default</span>
                                )}
                                <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-[10px] font-bold rounded uppercase">{addr.label}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 justify-end">
                            <button className="text-sm text-primary font-medium hover:underline">Edit</button>
                            {!addr.isDefault && (
                                <>
                                    <button className="text-sm text-muted-foreground hover:text-red-500 transition-colors">Delete</button>
                                    <button className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded hover:bg-secondary transition-colors">Set as Default</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {addresses.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
                    <p className="text-muted-foreground">No addresses found.</p>
                </div>
            )}
        </div>
    );
}
