
import AIChatDemo from '@/components/features/AIChatDemo';

export default function AIDemoPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-center mb-8">RJ Music AI Assistant (Demo)</h1>
            <p className="text-muted-foreground text-center mb-12">
                This is powered by Vercel AI SDK and Google Gemini.
            </p>
            <AIChatDemo />
        </div>
    );
}
