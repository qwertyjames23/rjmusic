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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

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

            // If user logged out, clear cart display and localStorage
            if (event === 'SIGNED_OUT') {
                setItems([]);
                setIsLoaded(false);
                // Clear the guest cart from localStorage
                localStorage.removeItem('rjmusic-cart-guest');
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

    const addToCart = (product: Product, quantity: number = 1) => {
        console.log('🛒 Adding to cart:', product.name, 'Quantity:', quantity);
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                const updated = prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
                console.log('🛒 Updated cart (existing item):', updated);
                return updated;
            }
            const newCart = [...prev, { ...product, quantity }];
            console.log('🛒 Updated cart (new item):', newCart);
            return newCart;
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
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
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    console.log('🛒 Cart Count:', cartCount, 'Items:', items.length);

    const cartTotal = items.reduce((acc, item) => {
        // Use declared price or fallback to 0 if something is wrong
        return acc + (item.price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
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
