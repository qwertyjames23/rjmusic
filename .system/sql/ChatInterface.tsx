"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

interface ChatInterfaceProps {
    conversationId: string;
    userId: string;
    initialMessages: Message[];
}

export function ChatInterface({ conversationId, userId, initialMessages }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from("messages")
                .insert({
                    conversation_id: conversationId,
                    sender_id: userId,
                    content: newMessage.trim(),
                });

            if (error) throw error;
            setNewMessage("");
            
            // Update conversation updated_at and mark as unread for admin
            await supabase
                .from("conversations")
                .update({ updated_at: new Date().toISOString(), is_read_by_admin: false })
                .eq("id", conversationId);

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-card border border-border rounded-xl shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === userId;
                    return (
                        <div key={msg.id} className={cn("flex gap-3", isMe ? "justify-end" : "justify-start")}>
                            {!isMe && (
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="size-5 text-primary" />
                                </div>
                            )}
                            <div className={cn(
                                "max-w-[80%] rounded-xl px-4 py-2 text-sm",
                                isMe 
                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                    : "bg-secondary text-secondary-foreground rounded-tl-none"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {isMe && (
                                <div className="size-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <User className="size-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 bg-secondary/20 border-t border-border flex gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-background border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isSending}
                />
                <button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </button>
            </form>
        </div>
    );
}