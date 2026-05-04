import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "image/jpeg"],
  ["image/png", "image/png"],
  ["image/webp", "image/webp"],
  ["image/gif", "image/gif"],
]);

const VISION_PROMPT = "Describe this product in 1-2 sentences focusing on what it is, its color, material, and category. Be concise and specific.";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

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

async function encodeImageToDataUrl(file: File, mimeType: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return ["data:", mimeType, ";base64,", base64].join("");
}

function buildVisionMessages(dataUrl: string): { role: "user"; content: { type: string; image_url?: { url: string }; text?: string }[] }[] {
  return [
    {
      role: "user",
      content: [
        { type: "image_url", image_url: { url: dataUrl } },
        { type: "text", text: VISION_PROMPT },
      ],
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const mimeType = ALLOWED_MIME_TYPES.get(file.type);
    if (!mimeType) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

    const dataUrl = await encodeImageToDataUrl(file, mimeType);
    if (!/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(dataUrl))
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    const visionMessages = buildVisionMessages(dataUrl);

    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: visionMessages,
      max_tokens: 100,
    });

    const rawCaption = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!rawCaption) return NextResponse.json({ error: "Could not understand image" }, { status: 422 });
    const caption = Array.from(rawCaption)
      .filter((ch) => /[a-zA-Z0-9\s.,'\-]/.test(ch))
      .join("")
      .slice(0, 500);

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
        score: cosineSimilarity(captionVec, tokenize(p.title + " " + p.description + " " + p.category.name)),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return NextResponse.json(scored);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
