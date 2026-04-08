import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Deletion | RJ Music Shop",
    description: "How to request deletion of your data from RJ Music Shop.",
};

export default function DataDeletionPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Data Deletion Request</h1>

            <p className="text-gray-400 mb-6">
                If you have interacted with RJ Music Shop through Facebook Messenger and would like
                your data deleted, please follow the steps below.
            </p>

            <h2 className="text-xl font-semibold mb-3">What data we store</h2>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                <li>Your Facebook name (used for order identification)</li>
                <li>Messages sent to our Messenger bot</li>
                <li>Order details (product, quantity, delivery address, contact number)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-3">How to request data deletion</h2>
            <p className="text-gray-400 mb-4">
                Send an email to{" "}
                <a href="mailto:rjmusicshop@gmail.com" className="text-primary underline">
                    rjmusicshop@gmail.com
                </a>{" "}
                with the subject line <strong>&quot;Data Deletion Request&quot;</strong> and include
                your Facebook name or Messenger ID. We will process your request within 30 days.
            </p>

            <p className="text-gray-400 text-sm">
                You may also contact us via our{" "}
                <a href="/contact" className="text-primary underline">
                    contact page
                </a>
                .
            </p>
        </div>
    );
}
