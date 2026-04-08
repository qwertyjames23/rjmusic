import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | RJ Music Shop",
    description: "Privacy policy for RJ Music Shop.",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mb-8">Last updated: March 2025</p>

            <p className="text-gray-400 mb-6">
                RJ Music Shop (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to
                protecting your privacy. This policy explains what information we collect, how we
                use it, and your rights regarding your data.
            </p>

            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                <li>Name, contact number, and delivery address (for order processing)</li>
                <li>Facebook name and Messenger ID (when ordering via Messenger)</li>
                <li>Order details (products purchased, quantities, payment method)</li>
                <li>Email address (if provided for newsletters or account registration)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                <li>To process and fulfill your orders</li>
                <li>To send order status updates and notifications</li>
                <li>To respond to inquiries and customer support requests</li>
                <li>To send newsletters (only if you subscribed)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
            <p className="text-gray-400 mb-6">
                We do not sell or share your personal information with third parties, except as
                necessary to fulfill your order (e.g., delivery services) or as required by law.
            </p>

            <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
            <p className="text-gray-400 mb-6">
                We retain your data for as long as necessary to provide our services. You may
                request deletion of your data at any time via our{" "}
                <a href="/data-deletion" className="text-primary underline">
                    data deletion page
                </a>
                .
            </p>

            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-gray-400">
                For privacy-related questions, email us at{" "}
                <a href="mailto:rjmusicshop@gmail.com" className="text-primary underline">
                    rjmusicshop@gmail.com
                </a>
                .
            </p>
        </div>
    );
}
