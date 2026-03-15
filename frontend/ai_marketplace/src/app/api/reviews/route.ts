import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyzeSentiment(rating: number, comment: string): Promise<string> {
  if (!comment) return rating >= 4 ? "POSITIVE" : rating <= 2 ? "NEGATIVE" : "NEUTRAL";
  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Classify the sentiment of this product review as exactly one word: POSITIVE, NEUTRAL, or NEGATIVE. Reply with only that word.",
        },
        { role: "user", content: `Rating: ${rating}/5. Comment: "${comment}"` },
      ],
      max_tokens: 5,
      temperature: 0,
    });
    const word = res.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
    return ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(word) ? word : "NEUTRAL";
  } catch {
    return rating >= 4 ? "POSITIVE" : rating <= 2 ? "NEGATIVE" : "NEUTRAL";
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const existing = await prisma.review.findFirst({ where: { productId, userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

  const sentiment = await analyzeSentiment(rating, comment ?? "");

  const review = await prisma.review.create({
    data: { productId, userId: session.user.id, rating, comment: comment ?? null, sentiment },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}
