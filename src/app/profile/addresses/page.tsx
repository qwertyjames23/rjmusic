"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Phone, Edit, Trash2, Check } from "lucide-react";
import { AddAddressModal } from "@/components/profile/AddAddressModal";
import { createClient } from "@/utils/supabase/client";
import { Address } from "@/types";

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchAddresses = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setAddresses([]);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("addresses")
                .select("*")
                .eq("user_id", user.id)
                .order("is_default", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;

            setAddresses(data || []);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        setDeletingId(id);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("addresses")
                .delete()
                .eq("id", id);

            if (error) throw error;

            await fetchAddresses();
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Failed to delete address");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("addresses")
                .update({ is_default: true })
                .eq("id", id);

            if (error) throw error;

            await fetchAddresses();
        } catch (error) {
            console.error("Error setting default address:", error);
            alert("Failed to set default address");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your shipping addresses
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="size-4" />
                    Add Address
                </button>
            </div>

            {/* Addresses List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="p-6 bg-card border border-border rounded-xl animate-pulse"
                        >
                            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                            <div className="h-3 bg-muted rounded w-full mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
                    <MapPin className="size-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No addresses found.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="size-4" />
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`p-6 bg-card border rounded-xl transition-all ${address.is_default
                                    ? "border-primary shadow-lg shadow-primary/10"
                                    : "border-border hover:border-primary/50"
                                }`}
                        >
                            {/* Default Badge */}
                            {address.is_default && (
                                <div className="flex items-center gap-1 text-xs font-medium text-primary mb-3">
                                    <Check className="size-3" />
                                    Default Address
                                </div>
                            )}

                            {/* Name */}
                            <h3 className="font-bold text-foreground mb-2">{address.name}</h3>

                            {/* Phone */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Phone className="size-4" />
                                {address.phone}
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                                <MapPin className="size-4 mt-0.5 shrink-0" />
                                <div>
                                    <p>{address.address_line1}</p>
                                    {address.address_line2 && <p>{address.address_line2}</p>}
                                    <p>
                                        {address.city}, {address.state} {address.postal_code}
                                    </p>
                                    <p>{address.country}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-border">
                                {!address.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="flex-1 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    disabled={deletingId === address.id}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    aria-label="Delete address"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Address Modal */}
            <AddAddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAddresses}
            />
        </div>
    );
}
