"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Message {
    id: string;
    content: string;
    is_from_admin: boolean;
    is_read: boolean;
    created_at: string;
    sender_id?: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabaseRef = useRef(createClient());
    const isOpenRef = useRef(isOpen);
    const shouldScrollRef = useRef(true);

    // Keep ref in sync
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // Check auth status and listen for changes
    useEffect(() => {
        const supabase = supabaseRef.current;
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user ? { id: user.id, email: user.email ?? undefined } : null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email ?? undefined });
            } else {
                setUser(null);
                setIsOpen(false);
                setMessages([]);
                setConversationId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch conversation ID on login (so realtime works even when chat is closed)
    useEffect(() => {
        if (!user) return;
        // Quick fetch just to get conversationId and unread count
        fetch("/api/messages")
            .then((res) => res.json())
            .then((data) => {
                if (data.conversation) {
                    setConversationId(data.conversation.id);
                }
                if (data.messages) {
                    const unread = data.messages.filter(
                        (m: Message) => m.sender_id !== user.id && !m.is_read
                    ).length;
                    setUnreadCount(unread);
                }
            })
            .catch(() => {});
    }, [user]);

    // Mark messages as read in the database
    const markAsRead = useCallback(async (convoId: string) => {
        try {
            await fetch("/api/messages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation_id: convoId }),
            });
        } catch {
            // silent fail
        }
    }, []);

    // Fetch full messages when chat opens + mark as read
    useEffect(() => {
        if (isOpen && user) {
            fetchMessages();
        }
    }, [isOpen, user]);

    // Realtime subscription for new messages (no filter — more reliable without REPLICA IDENTITY FULL)
    useEffect(() => {
        if (!conversationId || !user) return;

        const supabase = supabaseRef.current;
        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMsg = payload.new as Message & { conversation_id?: string };
                    // Only process messages for our conversation
                    if (newMsg.conversation_id !== conversationId) return;
                    // Only add if it's not from us (avoid duplicates with optimistic updates)
                    if (newMsg.sender_id !== user.id) {
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                        if (isOpenRef.current) {
                            // Chat is open — mark as read immediately
                            if (conversationId) markAsRead(conversationId);
                        } else {
                            // Chat is closed — increment unread
                            setUnreadCount((prev) => prev + 1);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, user]);

    // Polling fallback: check for new messages every 15s when chat is closed
    useEffect(() => {
        if (!user || !conversationId) return;

        const interval = setInterval(async () => {
            if (isOpenRef.current) return; // skip polling when chat is open
            try {
                const res = await fetch("/api/messages");
                const data = await res.json();
                if (data.messages) {
                    // Always use DB truth for unread count
                    const unread = data.messages.filter(
                        (m: Message) => m.sender_id !== user.id && !m.is_read
                    ).length;
                    setUnreadCount(unread);
                    setMessages(data.messages);
                }
            } catch {
                // silent fail
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [user, conversationId]);

    // Check if user is near bottom of chat scroll
    const isNearBottom = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return true;
        const threshold = 80; // px from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    // Track scroll position to decide if we should auto-scroll
    const handleScroll = useCallback(() => {
        shouldScrollRef.current = isNearBottom();
    }, [isNearBottom]);

    // Scroll to bottom — instant for initial load, smooth for new messages
    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    // Auto-scroll on new messages only if user is near bottom
    useEffect(() => {
        if (shouldScrollRef.current) {
            scrollToBottom("smooth");
        }
    }, [messages, scrollToBottom]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            shouldScrollRef.current = true;
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        let fetchedMessages: Message[] | null = null;
        let fetchedConversation: { id: string } | null = null;

        try {
            const res = await fetch("/api/messages");
            const data = await res.json();
            fetchedMessages = data.messages || null;
            fetchedConversation = data.conversation || null;

            if (fetchedMessages) {
                setMessages(fetchedMessages);
            }
            if (fetchedConversation) {
                setConversationId(fetchedConversation.id);

                if (isOpenRef.current) {
                    setUnreadCount(0);
                    await markAsRead(fetchedConversation.id);
                } else {
                    const unread = (fetchedMessages || []).filter(
                        (m: Message) => m.sender_id !== user?.id && !m.is_read
                    ).length;
                    setUnreadCount(unread);
                }
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            // Set loading false FIRST so messages render, THEN scroll
            setLoading(false);

            if (fetchedMessages && fetchedMessages.length > 0 && isOpenRef.current) {
                shouldScrollRef.current = true;
                // Wait for React to flush the loading=false render and paint messages
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        scrollToBottom("instant");
                    });
                });
            }
        }
    }, [markAsRead, user?.id, scrollToBottom]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const content = input.trim();
        setInput("");
        setSending(true);

        // User is sending — always scroll to show their message
        shouldScrollRef.current = true;

        // Optimistic update
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            content,
            is_from_admin: false,
            is_read: false,
            created_at: new Date().toISOString(),
            sender_id: user?.id,
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Replace optimistic message with real one
            setMessages((prev) =>
                prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
            );

            // Save conversation ID for realtime
            if (data.conversation_id && !conversationId) {
                setConversationId(data.conversation_id);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
            setInput(content);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        }
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    };

    // Don't render for non-authenticated users
    if (!user) return null;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-[#111827] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageCircle className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">RJ Music Support</h3>
                                <p className="text-xs text-blue-100">We typically reply within minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[340px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <Loader2 className="size-5 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                                <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <MessageCircle className="size-6 text-blue-500" />
                                </div>
                                <p className="text-gray-400 text-sm">Send us a message!</p>
                                <p className="text-gray-500 text-xs">We&apos;re here to help with any questions.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                                            msg.sender_id === user?.id
                                                ? "bg-blue-600 text-white rounded-br-sm"
                                                : "bg-[#1f2937] text-gray-200 rounded-bl-sm"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-blue-200" : "text-gray-500"}`}>
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-white/5 bg-[#0d1117]">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#1f2937] text-white text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 placeholder-gray-500 transition-colors"
                                maxLength={1000}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Send className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => {
                    const opening = !isOpen;
                    setIsOpen(opening);
                    if (opening) {
                        setUnreadCount(0);
                        if (conversationId) markAsRead(conversationId);
                    }
                }}
                className="fixed bottom-6 right-6 z-50 size-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
                {isOpen ? (
                    <X className="size-6" />
                ) : (
                    <>
                        <MessageCircle className="size-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </>
                )}
            </button>
        </>
    );
}
