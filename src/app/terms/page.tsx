import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | RJ Music Shop",
    description: "Terms of service for RJ Music Shop.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-gray-500 text-sm mb-8">Last updated: March 2025</p>

            <p className="text-gray-400 mb-6">
                By using our website or ordering through RJ Music Shop, you agree to the following
                terms and conditions.
            </p>

            <h2 className="text-xl font-semibold mb-3">Orders & Payments</h2>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                <li>All orders are subject to availability and confirmation.</li>
                <li>Prices are in Philippine Peso (PHP) and may change without prior notice.</li>
                <li>Payment must be completed before order processing.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-3">Shipping & Delivery</h2>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
                <li>Delivery times are estimates and may vary depending on location.</li>
                <li>We are not responsible for delays caused by third-party couriers.</li>
                <li>Please ensure your delivery address is accurate at the time of order.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-3">Returns & Refunds</h2>
            <p className="text-gray-400 mb-6">
                Please refer to our{" "}
                <a href="/returns" className="text-primary underline">
                    Returns Policy
                </a>{" "}
                for information on returns and refunds.
            </p>

            <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
            <p className="text-gray-400 mb-6">
                All content on this website, including images and text, is owned by RJ Music Shop
                and may not be reproduced without permission.
            </p>

            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-gray-400">
                For questions about these terms, contact us at{" "}
                <a href="mailto:rjmusicshop@gmail.com" className="text-primary underline">
                    rjmusicshop@gmail.com
                </a>
                .
            </p>
        </div>
    );
}
