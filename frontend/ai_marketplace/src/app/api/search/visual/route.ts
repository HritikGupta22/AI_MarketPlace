import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function tokenize(text: string): Record<string, number> {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const freq: Record<string, number> = {};
  for (const w of words) if (w) freq[w] = (freq[w] ?? 0) + 1;
  return freq;
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const k of keys) {
    const va = a[k] ?? 0, vb = b[k] ?? 0;
    dot += va * vb; magA += va * va; magB += vb * vb;
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Convert image to base64 for Groq vision
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Step 1: Use Groq vision to describe the image
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: "Describe this product in 1-2 sentences focusing on what it is, its color, material, and category. Be concise and specific." },
          ],
        },
      ],
      max_tokens: 100,
    });

    const caption = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!caption) return NextResponse.json({ error: "Could not understand image" }, { status: 422 });

    // Step 2: Match caption against products via cosine similarity
    const products = await prisma.product.findMany({
      where: { approved: true },
      include: { category: true },
      take: 100,
    });

    if (products.length === 0) return NextResponse.json([]);

    const captionVec = tokenize(caption);
    const scored = products
      .map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        images: p.images,
        caption,
        score: cosineSimilarity(captionVec, tokenize(`${p.title} ${p.description} ${p.category.name}`)),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return NextResponse.json(scored);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Visual Search Error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
