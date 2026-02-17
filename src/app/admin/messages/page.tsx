import { MessagesInbox } from "./_components/MessagesInbox";

export default function AdminMessagesPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Messages</h1>
                    <p className="text-gray-400 text-sm mt-1">Customer conversations</p>
                </div>
            </div>
            <MessagesInbox />
        </div>
    );
}
