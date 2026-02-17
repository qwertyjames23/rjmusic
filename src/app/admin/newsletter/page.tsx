import { NewsletterTable } from "./_components/NewsletterTable";

export const dynamic = "force-dynamic";

export default function NewsletterPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Newsletter Subscribers</h2>
                <p className="text-sm text-gray-400 mt-1">Manage your email subscriber list</p>
            </div>
            <NewsletterTable />
        </div>
    );
}
