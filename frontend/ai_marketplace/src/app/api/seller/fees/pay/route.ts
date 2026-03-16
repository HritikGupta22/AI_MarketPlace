import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { feeId, utr } = await req.json();
  if (!feeId || !utr?.trim())
    return NextResponse.json({ error: "Fee ID and UTR required" }, { status: 400 });

  const fee = await prisma.platformFee.findUnique({ where: { id: feeId } });
  if (!fee || fee.sellerId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (fee.status === "CONFIRMED")
    return NextResponse.json({ error: "Already confirmed" }, { status: 400 });

  const updated = await prisma.platformFee.update({
    where: { id: feeId },
    data: { utr: utr.trim(), status: "SUBMITTED", paidAt: new Date() },
  });

  return NextResponse.json(updated);
}
