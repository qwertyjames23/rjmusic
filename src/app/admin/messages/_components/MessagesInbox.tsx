"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, Loader2, User, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Conversation {
    id: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

interface Message {
    id: string;
    conversation_id: string;
    content: string;
    is_from_admin: boolean;
    is_read: boolean;
    created_at: string;
    sender_id: string;
}

export function MessagesInbox() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const selectedConvoRef = useRef<Conversation | null>(null);
    const supabaseRef = useRef(createClient());

    // Get current user ID
    useEffect(() => {
        const supabase = supabaseRef.current;
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUserId(user?.id ?? null);
        });
    }, []);

    // Keep ref in sync
    useEffect(() => {
        selectedConvoRef.current = selectedConvo;
    }, [selectedConvo]);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Realtime: listen for new messages across ALL conversations
    useEffect(() => {
        const supabase = supabaseRef.current;

        // Get current user ID to filter out own messages
        let currentUserId: string | null = null;
        supabase.auth.getUser().then(({ data: { user } }) => {
            currentUserId = user?.id ?? null;
        });

        const channel = supabase
            .channel("admin-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMsg = payload.new as Message;

                    // Skip messages sent by us (already handled by optimistic update)
                    if (newMsg.sender_id === currentUserId) return;

                    // If this message is for the currently selected conversation, add it
                    if (selectedConvoRef.current?.id === newMsg.conversation_id) {
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }

                    // Update conversation list (last message, unread count)
                    if (!newMsg.is_from_admin) {
                        setConversations((prev) =>
                            prev.map((c) => {
                                if (c.id === newMsg.conversation_id) {
                                    const isViewing = selectedConvoRef.current?.id === c.id;
                                    return {
                                        ...c,
                                        last_message: newMsg.content.substring(0, 100),
                                        last_message_at: newMsg.created_at,
                                        unread_count: isViewing ? c.unread_count : c.unread_count + 1,
                                    };
                                }
                                return c;
                            })
                        );
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "conversations",
                },
                () => {
                    // New conversation created — refresh list
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchConversations]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when conversation selected
    useEffect(() => {
        if (selectedConvo) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [selectedConvo]);

    const fetchConversations = useCallback(async () => {
        setLoadingConvos(true);
        try {
            const res = await fetch("/api/admin/messages");
            const data = await res.json();
            if (data.conversations) {
                setConversations(data.conversations);
            }
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        } finally {
            setLoadingConvos(false);
        }
    }, []);

    const selectConversation = async (convo: Conversation) => {
        setSelectedConvo(convo);
        setLoadingMessages(true);

        try {
            const res = await fetch(`/api/messages?conversation_id=${convo.id}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }

            // Mark as read
            if (convo.unread_count > 0) {
                await fetch("/api/admin/messages", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ conversation_id: convo.id }),
                });

                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === convo.id ? { ...c, unread_count: 0 } : c
                    )
                );
            }
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || sending || !selectedConvo) return;

        const content = input.trim();
        setInput("");
        setSending(true);

        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            conversation_id: selectedConvo.id,
            content,
            is_from_admin: true,
            is_read: false,
            created_at: new Date().toISOString(),
            sender_id: "",
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    conversation_id: selectedConvo.id,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setMessages((prev) =>
                prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
            );

            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedConvo.id
                        ? { ...c, last_message: content.substring(0, 100), last_message_at: new Date().toISOString() }
                        : c
                )
            );
        } catch (err) {
            console.error("Failed to send:", err);
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
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        }
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    };

    return (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
            {/* Conversations List */}
            <div className={`w-full md:w-[340px] border-r border-white/5 flex flex-col ${selectedConvo ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b border-white/5">
                    <h3 className="text-sm font-bold text-white">Conversations</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {conversations.length} total
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingConvos ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-5 animate-spin text-gray-500" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <MessageCircle className="size-6 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-sm">No conversations yet</p>
                            <p className="text-gray-500 text-xs mt-1">Messages from customers will appear here</p>
                        </div>
                    ) : (
                        conversations.map((convo) => (
                            <button
                                key={convo.id}
                                onClick={() => selectConversation(convo)}
                                className={`w-full text-left px-4 py-3.5 border-b border-white/5 hover:bg-white/5 transition-colors ${
                                    selectedConvo?.id === convo.id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : ""
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {convo.customer_name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white truncate">
                                                {convo.customer_name || "Customer"}
                                            </span>
                                            <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                                                {formatTime(convo.last_message_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-xs text-gray-400 truncate">
                                                {convo.last_message || "No messages"}
                                            </p>
                                            {convo.unread_count > 0 && (
                                                <span className="ml-2 flex-shrink-0 size-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {convo.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{convo.customer_email}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConvo ? "hidden md:flex" : "flex"}`}>
                {selectedConvo ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-[#0a0d11]">
                            <button
                                onClick={() => setSelectedConvo(null)}
                                title="Back to conversations"
                                className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="size-5 text-gray-400" />
                            </button>
                            <div className="size-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                {selectedConvo.customer_name?.charAt(0) || "?"}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">
                                    {selectedConvo.customer_name || "Customer"}
                                </h4>
                                <p className="text-xs text-gray-500">{selectedConvo.customer_email}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="size-5 animate-spin text-gray-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    No messages in this conversation
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUserId;
                                    return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className="flex items-end gap-2 max-w-[70%]">
                                            {!isMe && (
                                                <div className="size-7 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                                                    <User className="size-3.5 text-gray-400" />
                                                </div>
                                            )}
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                    isMe
                                                        ? "bg-blue-600 text-white rounded-br-sm"
                                                        : "bg-[#1f2937] text-gray-200 rounded-bl-sm"
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? "text-blue-200" : "text-gray-500"}`}>
                                                    {formatMessageTime(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-5 py-4 border-t border-white/5 bg-[#0a0d11]">
                            <div className="flex items-center gap-3">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-[#1f2937] text-white text-sm px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 placeholder-gray-500 transition-colors"
                                    maxLength={1000}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || sending}
                                    title="Send message"
                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
                            <MessageCircle className="size-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-300">Select a conversation</h3>
                        <p className="text-gray-500 text-sm max-w-[280px]">
                            Choose a customer conversation from the left to view and reply to their messages.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
