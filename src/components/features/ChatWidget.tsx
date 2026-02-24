"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Message {
    id: string;
    content: string;
    is_from_admin: boolean;
    is_read: boolean;
    created_at: string;
    sender_id?: string;
    conversation_id?: string;
    failed?: boolean;
}

interface Conversation {
    id: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

// ─── Shared Utilities ────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatRelative(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Typing Dots Animation ────────────────────────────────────────────────────

function TypingBubble() {
    return (
        <div className="flex justify-start">
            <div className="bg-[#1f2937] text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                <span className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
    const isTemp = msg.id.startsWith("temp-");
    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.failed
                        ? "bg-red-900/40 border border-red-500/40 text-red-300 rounded-br-sm"
                        : isMine
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-[#1f2937] text-gray-200 rounded-bl-sm"
                }`}
            >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                    {msg.failed ? (
                        <p className="text-[10px] text-red-400">Failed · tap to retry</p>
                    ) : (
                        <>
                            <p className={`text-[10px] ${isMine ? "text-blue-200" : "text-gray-500"}`}>
                                {formatTime(msg.created_at)}
                            </p>
                            {isMine && (
                                <span className="text-blue-200">
                                    {isTemp ? (
                                        <Check className="size-3 opacity-50" />
                                    ) : msg.is_read ? (
                                        <CheckCheck className="size-3" />
                                    ) : (
                                        <Check className="size-3" />
                                    )}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Chat Header ──────────────────────────────────────────────────────────────

function ChatHeader({
    title,
    subtitle,
    onClose,
    onBack,
}: {
    title: string;
    subtitle: string;
    onClose?: () => void;
    onBack?: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-700 to-blue-500 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button type="button" title="Back" onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1">
                        <ArrowLeft className="size-4" />
                    </button>
                )}
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="size-4" />
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-tight">{title}</h3>
                    <p className="text-[11px] text-blue-100 leading-tight">{subtitle}</p>
                </div>
            </div>
            {onClose && (
                <button type="button" title="Close chat" onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}

// ─── Message Input ────────────────────────────────────────────────────────────

function MessageInput({
    value,
    onChange,
    onSend,
    onTyping,
    sending,
    placeholder,
    inputRef,
}: {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    onTyping?: () => void;
    sending: boolean;
    placeholder: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
}) {
    return (
        <div className="px-4 py-3 border-t border-white/5 bg-[#0d1117] flex-shrink-0">
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => { onChange(e.target.value); onTyping?.(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                    placeholder={placeholder}
                    maxLength={1000}
                    className="flex-1 bg-[#1f2937] text-white text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 placeholder-gray-500 transition-colors"
                />
                <button
                    type="button"
                    title="Send message"
                    onClick={onSend}
                    disabled={!value.trim() || sending}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                    {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
            </div>
        </div>
    );
}

// ─── Customer Chat View ───────────────────────────────────────────────────────

function CustomerChat({
    user,
    onClose,
}: {
    user: { id: string; email?: string };
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabaseRef = useRef(createClient());
    const shouldScrollRef = useRef(true);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingBroadcastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null);

    const isNearBottom = useCallback(() => {
        const c = messagesContainerRef.current;
        if (!c) return true;
        return c.scrollHeight - c.scrollTop - c.clientHeight < 80;
    }, []);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (shouldScrollRef.current) scrollToBottom("smooth");
    }, [messages, scrollToBottom]);

    // Fetch messages + set up realtime
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/messages");
                const data = await res.json();
                if (!mounted) return;

                if (data.messages) setMessages(data.messages);
                if (data.conversation) {
                    setConversationId(data.conversation.id);
                    // Mark as read on open
                    fetch("/api/messages", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ conversation_id: data.conversation.id }),
                    }).catch(() => {});
                }
            } catch {/* silent */} finally {
                if (mounted) {
                    setLoading(false);
                    shouldScrollRef.current = true;
                    requestAnimationFrame(() => requestAnimationFrame(() => scrollToBottom("instant")));
                }
            }
        };

        init();
        return () => { mounted = false; };
    }, [scrollToBottom]);

    // Realtime subscription (set up once we have conversationId)
    useEffect(() => {
        if (!conversationId) return;
        const supabase = supabaseRef.current;

        const channel = supabase
            .channel(`customer-chat-${conversationId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    const msg = payload.new as Message;
                    if (msg.sender_id === user.id) return; // already shown via optimistic
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Mark as read immediately (chat is open)
                    fetch("/api/messages", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ conversation_id: conversationId }),
                    }).catch(() => {});
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    const updated = payload.new as Message;
                    setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, is_read: updated.is_read } : m));
                }
            )
            .on("broadcast", { event: "typing" }, (payload) => {
                if (payload.payload?.from === "admin") {
                    setIsTyping(true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
                }
            })
            .subscribe();

        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [conversationId, user.id]);

    // Broadcast typing to admin
    const broadcastTyping = useCallback(() => {
        if (!channelRef.current || !conversationId) return;
        if (typingBroadcastRef.current) return; // throttle
        channelRef.current.send({ type: "broadcast", event: "typing", payload: { from: "customer" } });
        typingBroadcastRef.current = setTimeout(() => { typingBroadcastRef.current = null; }, 2000);
    }, [conversationId]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        const content = input.trim();
        setInput("");
        setSending(true);
        shouldScrollRef.current = true;

        const tempId = `temp-${Date.now()}`;
        const optimistic: Message = { id: tempId, content, is_from_admin: false, is_read: false, created_at: new Date().toISOString(), sender_id: user.id };
        setMessages((prev) => [...prev, optimistic]);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessages((prev) => prev.map((m) => m.id === tempId ? data.message : m));
            if (data.conversation_id && !conversationId) setConversationId(data.conversation_id);
        } catch {
            setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, failed: true } : m));
        } finally {
            setSending(false);
        }
    };

    const retryFailed = (msg: Message) => {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        setInput(msg.content);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    return (
        <>
            <ChatHeader title="RJ Music Support" subtitle="We typically reply within minutes" onClose={onClose} />
            <div
                ref={messagesContainerRef}
                onScroll={() => { shouldScrollRef.current = isNearBottom(); }}
                className="flex-1 overflow-y-auto p-4 space-y-2"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <Loader2 className="size-5 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
                        <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <MessageCircle className="size-6 text-blue-500" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Send us a message!</p>
                        <p className="text-gray-500 text-xs">We&apos;re here to help with any questions.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} onClick={() => msg.failed && retryFailed(msg)} className={msg.failed ? "cursor-pointer" : ""}>
                            <MessageBubble msg={msg} isMine={msg.sender_id === user.id} />
                        </div>
                    ))
                )}
                {isTyping && <TypingBubble />}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                onTyping={broadcastTyping}
                sending={sending}
                placeholder="Type a message..."
                inputRef={inputRef}
            />
        </>
    );
}

// ─── Admin Widget View ────────────────────────────────────────────────────────

function AdminWidget({ adminId, onClose }: { adminId: string; onClose: () => void }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabaseRef = useRef(createClient());
    const selectedConvoRef = useRef<Conversation | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingBroadcastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null);

    // Keep ref in sync
    useEffect(() => { selectedConvoRef.current = selectedConvo; }, [selectedConvo]);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/messages");
            const data = await res.json();
            if (data.conversations) setConversations(data.conversations);
        } catch {/* silent */} finally {
            setLoadingConvos(false);
        }
    }, []);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // Realtime for admin: listen to ALL message inserts + new conversations
    useEffect(() => {
        const supabase = supabaseRef.current;
        const channel = supabase
            .channel("admin-widget")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
                const msg = payload.new as Message;
                if (msg.sender_id === adminId) return;

                // Add to messages if this convo is selected
                if (selectedConvoRef.current?.id === msg.conversation_id) {
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Mark as read
                    fetch("/api/admin/messages", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ conversation_id: msg.conversation_id }),
                    }).catch(() => {});
                }

                // Update sidebar
                if (!msg.is_from_admin) {
                    setConversations((prev) =>
                        prev.map((c) => c.id === msg.conversation_id ? {
                            ...c,
                            last_message: msg.content.substring(0, 100),
                            last_message_at: msg.created_at,
                            unread_count: selectedConvoRef.current?.id === c.id ? c.unread_count : c.unread_count + 1,
                        } : c)
                    );
                }
            })
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => {
                fetchConversations();
            })
            .subscribe();

        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [adminId, fetchConversations]);

    // Typing indicator from customer
    useEffect(() => {
        if (!selectedConvo) return;
        const supabase = supabaseRef.current;
        const channel = supabase
            .channel(`customer-chat-${selectedConvo.id}`)
            .on("broadcast", { event: "typing" }, (payload) => {
                if (payload.payload?.from === "customer") {
                    setIsTyping(true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedConvo]);

    // Broadcast typing to customer
    const broadcastTyping = useCallback(() => {
        if (!selectedConvo) return;
        if (typingBroadcastRef.current) return;
        const supabase = supabaseRef.current;
        supabase.channel(`customer-chat-${selectedConvo.id}`)
            .send({ type: "broadcast", event: "typing", payload: { from: "admin" } });
        typingBroadcastRef.current = setTimeout(() => { typingBroadcastRef.current = null; }, 2000);
    }, [selectedConvo]);

    const selectConversation = async (convo: Conversation) => {
        setSelectedConvo(convo);
        setIsTyping(false);
        setLoadingMsgs(true);
        try {
            const res = await fetch(`/api/messages?conversation_id=${convo.id}`);
            const data = await res.json();
            if (data.messages) setMessages(data.messages);
            if (convo.unread_count > 0) {
                await fetch("/api/admin/messages", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ conversation_id: convo.id }),
                });
                setConversations((prev) => prev.map((c) => c.id === convo.id ? { ...c, unread_count: 0 } : c));
            }
        } catch {/* silent */} finally {
            setLoadingMsgs(false);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "instant" }), 50);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || sending || !selectedConvo) return;
        const content = input.trim();
        setInput("");
        setSending(true);

        const tempId = `temp-${Date.now()}`;
        const optimistic: Message = { id: tempId, conversation_id: selectedConvo.id, content, is_from_admin: true, is_read: false, created_at: new Date().toISOString(), sender_id: adminId };
        setMessages((prev) => [...prev, optimistic]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, conversation_id: selectedConvo.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessages((prev) => prev.map((m) => m.id === tempId ? data.message : m));
            setConversations((prev) => prev.map((c) => c.id === selectedConvo.id ? { ...c, last_message: content.substring(0, 100), last_message_at: new Date().toISOString() } : c));
        } catch {
            setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, failed: true } : m));
            setInput(content);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (selectedConvo) setTimeout(() => inputRef.current?.focus(), 100);
    }, [selectedConvo]);

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    // Conversation list view
    if (!selectedConvo) {
        return (
            <>
                <ChatHeader
                    title="Messages"
                    subtitle={totalUnread > 0 ? `${totalUnread} unread` : `${conversations.length} conversations`}
                    onClose={onClose}
                />
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
                            <p className="text-gray-500 text-xs mt-1">Customer messages will appear here</p>
                        </div>
                    ) : (
                        conversations.map((convo) => (
                            <button
                                type="button"
                                key={convo.id}
                                onClick={() => selectConversation(convo)}
                                className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="size-9 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {convo.customer_name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-semibold truncate ${convo.unread_count > 0 ? "text-white" : "text-gray-300"}`}>
                                                {convo.customer_name || "Customer"}
                                            </span>
                                            <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                                                {formatRelative(convo.last_message_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-xs text-gray-400 truncate">{convo.last_message || "No messages"}</p>
                                            {convo.unread_count > 0 && (
                                                <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {convo.unread_count > 99 ? "99+" : convo.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </>
        );
    }

    // Conversation chat view
    return (
        <>
            <ChatHeader
                title={selectedConvo.customer_name || "Customer"}
                subtitle={selectedConvo.customer_email}
                onClose={onClose}
                onBack={() => { setSelectedConvo(null); setMessages([]); setIsTyping(false); }}
            />
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="size-5 animate-spin text-gray-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">No messages yet</div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} isMine={msg.sender_id === adminId} />
                    ))
                )}
                {isTyping && <TypingBubble />}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                onTyping={broadcastTyping}
                sending={sending}
                placeholder="Reply to customer..."
                inputRef={inputRef}
            />
        </>
    );
}

// ─── Main ChatWidget ──────────────────────────────────────────────────────────

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const supabaseRef = useRef(createClient());

    // Auth + role detection
    useEffect(() => {
        const supabase = supabaseRef.current;

        const loadUser = async (userId: string, email?: string) => {
            setUser({ id: userId, email });
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
            setIsAdmin(profile?.role === "admin");
        };

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) loadUser(user.id, user.email ?? undefined);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUser(session.user.id, session.user.email ?? undefined);
            } else {
                setUser(null);
                setIsAdmin(false);
                setIsOpen(false);
                setUnreadCount(0);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Unread count for customers (admin unread handled inside AdminWidget)
    useEffect(() => {
        if (!user || isAdmin) return;
        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/messages");
                const data = await res.json();
                if (data.messages && user) {
                    const count = data.messages.filter((m: Message) => m.sender_id !== user.id && !m.is_read).length;
                    setUnreadCount(count);
                }
            } catch {/* silent */}
        };
        fetchUnread();
        const interval = setInterval(() => { if (!isOpen) fetchUnread(); }, 15000);
        return () => clearInterval(interval);
    }, [user, isAdmin, isOpen]);

    if (!user) return null;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-50 w-full md:w-[360px] h-full md:h-auto md:max-h-[520px] bg-[#111827] md:border md:border-white/10 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden md:animate-in md:slide-in-from-bottom-4 md:duration-300">
                    {user && isAdmin ? (
                        <AdminWidget adminId={user.id} onClose={() => setIsOpen(false)} />
                    ) : user ? (
                        <CustomerChat user={user} onClose={() => { setIsOpen(false); setUnreadCount(0); }} />
                    ) : null}
                </div>
            )}

            {/* Floating Button — hidden on mobile when chat is open (full screen covers everything) */}
            <button
                type="button"
                title={isOpen ? "Close chat" : "Open chat"}
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    if (!isOpen) setUnreadCount(0);
                }}
                className={`fixed bottom-6 right-6 z-50 size-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isOpen ? "md:flex hidden" : "flex"}`}
            >
                {isOpen ? (
                    <X className="size-6" />
                ) : (
                    <>
                        <MessageCircle className="size-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </>
                )}
            </button>
        </>
    );
}
