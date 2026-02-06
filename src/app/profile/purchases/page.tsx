"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Truck, ShoppingBag, Star, RotateCcw, CheckCircle2, Package, Clock, XCircle, Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Order, OrderItem } from "@/types";
import { useRouter } from "next/navigation";
import { ReviewModal } from "./_components/ReviewModal";

type OrderStatus = "All" | "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface OrderWithItems extends Order {
    items: OrderItem[];
}

export default function MyPurchasesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<OrderStatus>("All");
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewItem, setSelectedReviewItem] = useState<{ id: string, name: string, image: string } | null>(null);
    const [selectedReviewOrderId, setSelectedReviewOrderId] = useState<string>("");

    const tabs: OrderStatus[] = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    const fetchOrders = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login?next=/profile/purchases");
                return;
            }

            // Fetch orders for current user
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch items for each order
            const ordersWithItems: OrderWithItems[] = [];
            for (const order of ordersData || []) {
                const { data: itemsData } = await supabase
                    .from("order_items")
                    .select("*")
                    .eq("order_id", order.id);

                ordersWithItems.push({
                    ...order,
                    items: itemsData || []
                });
            }

            setOrders(ordersWithItems);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [router, supabase]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Real-time subscription for Status Updates
    useEffect(() => {
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel('customer-orders-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                    },
                    (payload) => {
                        console.log("Realtime update received:", payload);
                        const updatedOrder = payload.new as Order;

                        setOrders((prevOrders) =>
                            prevOrders.map((order) =>
                                order.id === updatedOrder.id
                                    ? { ...order, ...updatedOrder } // Merge new status/data
                                    : order
                            )
                        );
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupRealtime();
    }, [supabase]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="size-5" />;
            case 'processing':
                return <Package className="size-5" />;
            case 'shipped':
                return <Truck className="size-5" />;
            case 'delivered':
                return <CheckCircle2 className="size-5" />;
            case 'cancelled':
                return <XCircle className="size-5" />;
            default:
                return <Package className="size-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'text-yellow-400';
            case 'processing':
                return 'text-blue-400';
            case 'shipped':
                return 'text-purple-400';
            case 'delivered':
                return 'text-green-400';
            case 'cancelled':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const handleRateItem = (item: OrderItem, orderId: string) => {
        // item.product_id is likely the id we want, but check type definition. 
        // OrderItem usually has product_id.
        setSelectedReviewItem({
            id: item.product_id,
            name: item.product_name,
            image: item.product_image
        });
        setSelectedReviewOrderId(orderId);
        setReviewModalOpen(true);
    };

    // Filter orders based on active tab and search
    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === "All" || order.status.toLowerCase() === activeTab.toLowerCase();
        const matchesSearch = searchQuery === "" ||
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    // Calculate summary
    const totalOrders = orders.length;
    const totalSpent = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 font-sans">
            {/* Tabs */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm sticky top-[73px] z-40">
                <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] py-4 px-4 text-center transition-colors relative ${activeTab === tab
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground font-medium"
                                }`}
                        >
                            <span className="text-sm">{tab}</span>
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Orders */}
                <div className="p-4 bg-secondary/20">
                    <div className="relative group max-w-2xl">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Search className="size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            className="block w-full pl-11 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground"
                            placeholder="Search by Order ID or Product Name"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <ShoppingBag className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-6">
                        {activeTab === "All"
                            ? "You haven't made any purchases yet."
                            : `No ${activeTab.toLowerCase()} orders.`}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
                    >
                        Start Shopping
                        <ChevronRight className="size-4" />
                    </Link>
                </div>
            ) : (
                filteredOrders.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Order Header */}
                        <div className="px-6 py-4 flex justify-between items-center border-b border-border bg-secondary/10">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold">Order #{order.order_number || order.id.slice(0, 8)}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className={`text-xs font-bold uppercase tracking-wider capitalize ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'animate-pulse' : ''}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6 space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="size-20 sm:size-24 rounded-lg bg-secondary border border-border overflow-hidden shrink-0 relative">
                                        {item.product_image ? (
                                            <Image
                                                src={item.product_image}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <Package className="size-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="text-base font-bold mb-1 line-clamp-1">{item.product_name}</h3>
                                            <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                                            <div className="text-primary font-bold">
                                                {formatPrice(item.subtotal)}
                                            </div>
                                            {/* Rate Product Button - Only visible if delivered */}
                                            {order.status.toLowerCase() === 'delivered' && (
                                                <button
                                                    onClick={() => handleRateItem(item, order.id)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-lg transition-colors w-fit"
                                                >
                                                    <Star className="size-3.5 fill-yellow-500" />
                                                    Rate Item
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Footer */}
                        <div className="px-6 py-4 bg-secondary/5 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <span className="text-sm text-muted-foreground">
                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </span>
                                <div className="h-4 w-px bg-border" />
                                <span className="text-lg font-bold text-primary">
                                    Total: {formatPrice(order.total)}
                                </span>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                {order.status === 'delivered' && (
                                    <>
                                        <button className="flex-1 md:flex-none px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <RotateCcw className="size-4" /> Buy Again
                                        </button>
                                    </>
                                )}
                                {(order.status === 'pending' || order.status === 'processing') && (
                                    <button className="flex-1 md:flex-none px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-colors">
                                        Contact Seller
                                    </button>
                                )}
                                {order.status === 'shipped' && (
                                    <button className="flex-1 md:flex-none px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                                        <Truck className="size-4" /> Track Order
                                    </button>
                                )}
                                <Link
                                    href={`/order-confirmation/${order.id}`}
                                    className="flex-1 md:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 text-foreground text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    View Details
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Purchase Summary */}
            {orders.length > 0 && (
                <div className="p-6 bg-card border border-border rounded-xl">
                    <h4 className="text-sm font-bold mb-4 uppercase tracking-wider border-b border-border pb-2">Purchase History Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs uppercase font-medium">Total Orders</p>
                            <p className="text-xl font-bold">{totalOrders}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs uppercase font-medium">Total Spent</p>
                            <p className="text-xl font-bold text-primary">{formatPrice(totalSpent)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs uppercase font-medium">Completed Orders</p>
                            <p className="text-xl font-bold text-green-400">{completedOrders}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {selectedReviewItem && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    product={selectedReviewItem}
                    orderId={selectedReviewOrderId}
                    onReviewSubmitted={() => {
                        // Ideally show a toast here
                        setReviewModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
