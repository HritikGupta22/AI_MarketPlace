import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_COMMENT_LEN = 300;
const MAX_PROMPT_LEN = 3000;

type SafeInput = { readonly value: string };

function validateAndClean(val: string, maxLen: number): SafeInput {
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
  return Object.freeze({ value: cleaned });
}

function buildReviewLine(rating: number, comment: SafeInput): string {
  return "Rating " + rating + "/5: " + comment.value;
}

function getUserContent(lines: string[]): string {
  return lines.join("\n").slice(0, MAX_PROMPT_LEN);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, hidden: false },
    select: { rating: true, comment: true },
  });

  if (reviews.length < 2) return NextResponse.json({ summary: null });

  const reviewLines: string[] = reviews
    .filter((r) => r.comment)
    .map((r) => buildReviewLine(r.rating, validateAndClean(r.comment!, MAX_COMMENT_LEN)));

  if (reviewLines.length === 0) return NextResponse.json({ summary: null });

  const chatMessages: { role: "system" | "user"; content: string }[] = [
    {
      role: "system",
      content: "Summarize these product reviews in 2-3 sentences. Mention overall sentiment, key positives, and any common complaints. Be concise and neutral.",
    },
    { role: "user", content: getUserContent(reviewLines) },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: chatMessages,
    max_tokens: 120,
    temperature: 0.5,
  });

  const summary = completion.choices[0]?.message?.content?.trim() ?? null;
  return NextResponse.json({ summary });
}
