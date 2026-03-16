import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, hidden: false },
    select: { rating: true, comment: true },
  });

  if (reviews.length < 2) return NextResponse.json({ summary: null });

  const reviewText = reviews
    .filter((r) => r.comment)
    .map((r) => `${r.rating}/5: "${r.comment}"`)
    .join("\n");

  if (!reviewText) return NextResponse.json({ summary: null });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Summarize these product reviews in 2-3 sentences. Mention overall sentiment, key positives, and any common complaints. Be concise and neutral.",
      },
      { role: "user", content: reviewText },
    ],
    max_tokens: 120,
    temperature: 0.5,
  });

  const summary = completion.choices[0]?.message?.content?.trim() ?? null;
  return NextResponse.json({ summary });
}
