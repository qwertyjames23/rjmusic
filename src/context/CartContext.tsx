"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product, CartItem } from "@/types";
import { createClient } from "@/utils/supabase/client";

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    selectedTotal: number;
    removeItems: (productIds: string[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Get user ID on mount and listen for auth changes
    useEffect(() => {
        const supabase = createClient();

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserId(user?.id || 'guest');
        });

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const newUserId = session?.user?.id || 'guest';

            // If user logged IN, merge guest cart with user cart
            if (event === 'SIGNED_IN' && session?.user?.id) {
                try {
                    // Get guest cart
                    const guestCart = localStorage.getItem('rjmusic-cart-guest');
                    const guestItems = guestCart ? JSON.parse(guestCart) : [];

                    // Get user cart
                    const userCartKey = `rjmusic-cart-${session.user.id}`;
                    const userCart = localStorage.getItem(userCartKey);
                    const userItems = userCart ? JSON.parse(userCart) : [];

                    // Merge carts (combine items, update quantities if duplicate)
                    const mergedItems = [...userItems];
                    guestItems.forEach((guestItem: CartItem) => {
                        const existingIndex = mergedItems.findIndex(item => item.id === guestItem.id);
                        if (existingIndex >= 0) {
                            // Item exists, add quantities
                            mergedItems[existingIndex].quantity += guestItem.quantity;
                        } else {
                            // New item, add to cart
                            mergedItems.push(guestItem);
                        }
                    });

                    // Save merged cart to user's localStorage
                    localStorage.setItem(userCartKey, JSON.stringify(mergedItems));

                    // Clear guest cart
                    localStorage.removeItem('rjmusic-cart-guest');

                    // Update state
                    setItems(mergedItems);
                } catch (error) {
                    console.error('Failed to merge guest cart:', error);
                }
            } else if (event === 'SIGNED_OUT') {
                setItems([]);
                setSelectedItems([]);
            } else if (event === 'INITIAL_SESSION') {
                // Load selected items if available
                const savedSelected = localStorage.getItem('rjmusic-cart-selected');
                if (savedSelected) {
                    setSelectedItems(JSON.parse(savedSelected));
                }
            }

            setUserId(newUserId);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Load from localStorage when userId is available
    useEffect(() => {
        if (!userId) return;

        try {
            const cartKey = `rjmusic-cart-${userId}`;
            const savedCart = localStorage.getItem(cartKey);
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }

            // Load selected items
            const savedSelected = localStorage.getItem('rjmusic-cart-selected');
            if (savedSelected) {
                setSelectedItems(JSON.parse(savedSelected));
            }
        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, [userId]);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isLoaded && userId) {
            const cartKey = `rjmusic-cart-${userId}`;
            localStorage.setItem(cartKey, JSON.stringify(items));
        }
    }, [items, isLoaded, userId]);

    // Save selected items to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rjmusic-cart-selected', JSON.stringify(selectedItems));
        }
    }, [selectedItems, isLoaded]);

    const addToCart = (product: Product, quantity: number = 1) => {
        // ... addToCart logic (kept same, implicit)
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Auto-select new items
            setSelectedItems(prev => [...prev, product.id]);
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
        setSelectedItems(prev => prev.filter(id => id !== productId));
    };

    const removeItems = (productIds: string[]) => {
        setItems(prev => prev.filter(item => !productIds.includes(item.id)));
        setSelectedItems(prev => prev.filter(id => !productIds.includes(id)));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        setSelectedItems([]);
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    console.log('🛒 Cart Count:', cartCount, 'Items:', items.length);

    const cartTotal = items.reduce((acc, item) => {
        // Use declared price or fallback to 0 if something is wrong
        return acc + (item.price * item.quantity);
    }, 0);

    // Calculate total for selected items only
    const selectedTotal = items
        .filter(item => selectedItems.includes(item.id))
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            selectedItems,
            setSelectedItems,
            selectedTotal,
            removeItems
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
