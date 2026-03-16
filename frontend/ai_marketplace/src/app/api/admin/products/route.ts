import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "pending" | "approved" | null = all

  const products = await prisma.product.findMany({
    where: filter === "pending" ? { approved: false } : filter === "approved" ? { approved: true } : {},
    include: {
      seller: { select: { id: true, name: true, email: true } },
      category: { select: { name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
