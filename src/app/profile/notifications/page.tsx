"use client";

import { Bell, Package, Tag, Info } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            type: "order",
            title: "Order Delivered",
            message: "Your order #RJ-88291 has been delivered. Enjoy your new gear!",
            date: "2 hours ago",
            read: false,
        },
        {
            id: 2,
            type: "promo",
            title: "11.11 Big Sale is Coming!",
            message: "Get up to 50% off on selected Gibson guitars. Add to cart now.",
            date: "1 day ago",
            read: true,
        },
        {
            id: 3,
            type: "system",
            title: "Account Security",
            message: "We noticed a new login from a different device. Was this you?",
            date: "3 days ago",
            read: true,
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case "order": return <Package className="size-5 text-primary" />;
            case "promo": return <Tag className="size-5 text-orange-500" />;
            default: return <Info className="size-5 text-blue-500" />;
        }
    };

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <p className="text-muted-foreground text-sm mt-1">Order updates and promotions</p>
                </div>
                <button className="text-sm text-primary hover:underline">Mark all as read</button>
            </div>

            <div className="divide-y divide-border">
                {notifications.map((item) => (
                    <div key={item.id} className={`p-6 flex gap-4 hover:bg-secondary/20 transition-colors ${!item.read ? 'bg-primary/5' : ''}`}>
                        <div className="size-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm mb-1 ${!item.read ? 'font-bold' : 'font-medium'}`}>{item.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-2">{item.message}</p>
                            <span className="text-xs text-muted-foreground/70">{item.date}</span>
                        </div>
                        {!item.read && (
                            <div className="size-2 rounded-full bg-red-500 mt-2 shrink-0"></div>
                        )}
                    </div>
                ))}
            </div>
            {notifications.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
                    <Bell className="size-16 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No notifications yet</p>
                </div>
            )}
        </div>
    );
}
