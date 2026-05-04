import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_COMMENT_LEN = 500;
const SENTIMENT_VALUES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;

type SafeInput = { readonly value: string };

function validateAndClean(val: unknown, maxLen: number): SafeInput {
  if (typeof val !== "string") return Object.freeze({ value: "" });
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
  return Object.freeze({ value: cleaned });
}

function buildSentimentLines(rating: number, comment: SafeInput): string[] {
  return [
    "Rating out of 5: " + rating,
    "Review text: " + comment.value,
  ];
}

function getUserContent(lines: string[]): string {
  return lines.join("\n");
}

async function analyzeSentiment(rating: number, input: SafeInput): Promise<string> {
  if (!input.value) return rating >= 4 ? "POSITIVE" : rating <= 2 ? "NEGATIVE" : "NEUTRAL";

  try {
    const chatMessages: { role: "system" | "user"; content: string }[] = [
      {
        role: "system",
        content: "Classify the sentiment of this product review as exactly one word: POSITIVE, NEUTRAL, or NEGATIVE. Reply with only that word.",
      },
      { role: "user", content: getUserContent(buildSentimentLines(rating, input)) },
    ];

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      max_tokens: 5,
      temperature: 0,
    });

    const word = res.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
    return SENTIMENT_VALUES.includes(word as typeof SENTIMENT_VALUES[number]) ? word : "NEUTRAL";
  } catch {
    return rating >= 4 ? "POSITIVE" : rating <= 2 ? "NEGATIVE" : "NEUTRAL";
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { productId, rating } = body;
  const comment = validateAndClean(body.comment, MAX_COMMENT_LEN);

  if (!productId || !rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const existing = await prisma.review.findFirst({ where: { productId, userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

  const sentiment = await analyzeSentiment(rating, comment);

  const review = await prisma.review.create({
    data: { productId, userId: session.user.id, rating, comment: comment.value || null, sentiment },
    include: {
      user: { select: { name: true, image: true } },
      reply: { include: { seller: { select: { name: true } } } },
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, hidden: false },
    include: {
      user: { select: { name: true, image: true } },
      reply: { include: { seller: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}
