import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Google Gemini API Key");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are RJ Music Assistant, a friendly music expert from the Philippines. You are knowledgeable about musical instruments, gear, and store policies. You are helpful and polite."
        });

        // Convert messages to Google format
        // Google expects: { role: "user" | "model", parts: [{ text: "..." }] }
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(lastMessage.content);
        const text = result.response.text();

        return Response.json({ text });

    } catch (e: any) {
        console.error("Gemini API Error:", e);

        let errorMessage = "Unknown error";
        if (e instanceof Error) {
            errorMessage = e.message;
        } else {
            try {
                errorMessage = JSON.stringify(e);
            } catch {
                errorMessage = String(e);
            }
        }

        return new Response(JSON.stringify({
            error: "Gemini API Error",
            details: errorMessage
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
