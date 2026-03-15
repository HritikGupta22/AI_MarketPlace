import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { title, category } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a product copywriter for an Indian e-commerce marketplace. Write compelling, honest product descriptions. Be concise (2-4 sentences). No bullet points. No markdown.",
      },
      {
        role: "user",
        content: `Write a product description for: "${title}"${category ? ` in the category "${category}"` : ""}.`,
      },
    ],
    max_tokens: 120,
    temperature: 0.8,
  });

  const description = completion.choices[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ description });
}
