import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { vote } = await req.json(); // "helpful" | "notHelpful"
  if (vote !== "helpful" && vote !== "notHelpful")
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

  const review = await prisma.review.update({
    where: { id },
    data: vote === "helpful" ? { helpful: { increment: 1 } } : { notHelpful: { increment: 1 } },
    select: { helpful: true, notHelpful: true },
  });

  return NextResponse.json(review);
}
