import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [target, all] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { category: true } }),
    prisma.product.findMany({
      where: { approved: true, id: { not: id } },
      include: { category: true },
      take: 100,
    }),
  ]);

  if (!target) return NextResponse.json([], { status: 404 });

  const targetVec = tokenize(`${target.title} ${target.description} ${target.category.name}`);

  const scored = all
    .map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      images: p.images,
      category: p.category.name,
      score: cosineSimilarity(targetVec, tokenize(`${p.title} ${p.description} ${p.category.name}`)),
    }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return NextResponse.json(scored);
}
