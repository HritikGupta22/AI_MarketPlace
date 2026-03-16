import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const review = await prisma.review.findUnique({
    where: { id },
    include: { product: { select: { sellerId: true } } },
  });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.product.sellerId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.reviewReply.findUnique({ where: { reviewId: id } });
  if (existing) return NextResponse.json({ error: "Already replied" }, { status: 400 });

  const reply = await prisma.reviewReply.create({
    data: { reviewId: id, sellerId: session.user.id, content: content.trim() },
    include: { seller: { select: { name: true } } },
  });

  return NextResponse.json(reply, { status: 201 });
}
