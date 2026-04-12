import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { hidden: false, sentiment: "POSITIVE", rating: { gte: 4 } },
    include: {
      user: { select: { name: true, image: true } },
      product: { select: { title: true } },
    },
    orderBy: { helpful: "desc" },
    take: 6,
  });

  return NextResponse.json(reviews);
}
