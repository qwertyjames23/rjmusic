"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PROVINCES, CITIES_BY_PROVINCE } from "@/lib/ph-locations";

interface AddAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddAddressModal({ isOpen, onClose, onSuccess }: AddAddressModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Philippines",
        is_default: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, state: e.target.value, city: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("You must be logged in to add an address");
            }

            const { error: insertError } = await supabase
                .from("addresses")
                .insert([
                    {
                        ...formData,
                        user_id: user.id,
                    }
                ]);

            if (insertError) throw insertError;

            // Reset form
            setFormData({
                name: "",
                phone: "",
                address_line1: "",
                address_line2: "",
                city: "",
                state: "",
                postal_code: "",
                country: "Philippines",
                is_default: false,
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error adding address:", err);
            setError(err instanceof Error ? err.message : "Failed to add address");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1a1f26] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Add New Address</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label="Close"
                    >
                        <X className="size-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="+63 912 345 6789"
                            />
                        </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                        <label htmlFor="address_line1" className="block text-sm font-medium text-gray-300 mb-2">
                            Address Line 1 *
                        </label>
                        <input
                            type="text"
                            id="address_line1"
                            name="address_line1"
                            value={formData.address_line1}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Street address, P.O. box"
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                        <label htmlFor="address_line2" className="block text-sm font-medium text-gray-300 mb-2">
                            Address Line 2 (Optional)
                        </label>
                        <input
                            type="text"
                            id="address_line2"
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                    </div>

                    {/* City, State, Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">
                                Province *
                            </label>
                            <select
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleProvinceChange}
                                required
                                className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select province</option>
                                {PROVINCES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                                City / Municipality *
                            </label>
                            <select
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                disabled={!formData.state}
                                className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="">{formData.state ? "Select city" : "Select province first"}</option>
                                {(CITIES_BY_PROVINCE[formData.state] ?? []).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-300 mb-2">
                                Postal Code *
                            </label>
                            <input
                                type="text"
                                id="postal_code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="6000"
                            />
                        </div>
                    </div>

                    {/* Country */}
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                            Country *
                        </label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="Philippines">Philippines</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                        </select>
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="size-4 rounded border-white/10 bg-[#0f1419] text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                        />
                        <label htmlFor="is_default" className="text-sm text-gray-300">
                            Set as default address
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                            aria-label="Cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Adding..." : "Add Address"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
