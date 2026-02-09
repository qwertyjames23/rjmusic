import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ChevronRight, MessageSquare, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/profile/messages");
    }

    const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*, messages(count)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching conversations:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Messages</h1>
                <Link
                    href="/profile/messages/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors text-sm"
                >
                    <Plus className="size-4" />
                    New Message
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm">
                {conversations && conversations.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {conversations.map((convo) => (
                            <li key={convo.id}>
                                <Link 
                                    href={`/profile/messages/${convo.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-bold text-foreground">{convo.subject}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Last updated: {new Date(convo.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                        <ChevronRight className="size-5" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-12 text-center">
                        <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-bold text-lg">No messages yet</h3>
                        <p className="text-muted-foreground text-sm">Start a new conversation with us.</p>
                    </div>
                )}
            </div>
        </div>
    );
}