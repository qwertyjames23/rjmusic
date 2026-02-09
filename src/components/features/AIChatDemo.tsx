"use client";

import { Send, User as UserIcon, Bot, Loader2, AlertCircle } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// Define message type manually since we are going manual
type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export default function AIChatDemo() {
    // Manual state management to ensure full control
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, error]);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        };

        // 1. Update UI immediately
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            // 2. Call API manually
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages.concat(userMessage).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Details:", errorData);
                throw new Error(errorData.error || errorData.details || response.statusText);
            }

            // 3. Handle JSON Response (Non-Streaming)
            const data = await response.json();

            // Add assistant message
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.text
            }]);

        } catch (err) {
            console.error("Manual fetch error:", err);
            setError(err instanceof Error ? err : new Error("Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border border-border rounded-xl bg-card overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-primary/10 p-4 border-b border-border flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" />
                <div>
                    <h3 className="font-bold text-foreground">RJ Music Assistant</h3>
                    <p className="text-xs text-muted-foreground">Ask me about guitars, drums, or anything music!</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                {messages.length === 0 && !error && (
                    <div className="text-center text-muted-foreground py-10 opacity-50">
                        <Bot className="w-12 h-12 mx-auto mb-2" />
                        <p>Start chatting with the AI assistant...</p>
                    </div>
                )}

                {messages.map(m => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role !== 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                        )}

                        <div className={`rounded-xl px-4 py-2 max-w-[80%] text-sm ${m.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-secondary text-secondary-foreground rounded-tl-none'
                            } overflow-hidden`}>
                            {/* Basic cleanup done in stream handler, but specific robust display just in case */}
                            <p className="whitespace-pre-wrap">
                                {m.content}
                            </p>
                        </div>

                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <UserIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="bg-secondary px-4 py-2 rounded-xl rounded-tl-none flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-xs">Thinking...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex gap-2 items-start mx-auto max-w-[90%]">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Something went wrong</p>
                            <p className="text-xs opacity-90">{error.message}</p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={handleManualSubmit}
                className="p-4 bg-card border-t border-border flex gap-2"
            >
                <input
                    className="flex-1 bg-secondary text-foreground px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    disabled={isLoading}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center shrink-0 h-10 w-10"
                    title="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
