import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, productTitle, productPrice, productDescription } = await req.json();

    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    const systemPrompt = `You are a helpful seller assistant for an online marketplace.
You are representing a product listing with the following details:
- Product: ${productTitle ?? "Unknown product"}
- Price: ₹${productPrice ?? "N/A"}
- Description: ${productDescription ?? "No description available"}

Your job is to help buyers with questions about this product. Be friendly, concise, and helpful.
If asked about price negotiation, say the seller will get back to them.
Never make up information not provided above. Keep replies under 3 sentences.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'll get back to you shortly!";
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI Chat Error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
