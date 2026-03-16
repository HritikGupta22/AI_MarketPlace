import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { hidden } = await req.json();

  const review = await prisma.review.update({
    where: { id },
    data: { hidden: Boolean(hidden) },
    select: { id: true, hidden: true },
  });

  return NextResponse.json(review);
}
