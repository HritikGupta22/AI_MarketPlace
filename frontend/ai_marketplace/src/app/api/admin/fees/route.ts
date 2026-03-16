import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  // Mark overdue globally
  await prisma.platformFee.updateMany({
    where: { status: "PENDING", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

  const fees = await prisma.platformFee.findMany({
    include: { seller: { select: { id: true, name: true, email: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const totalCollected = fees
    .filter((f) => f.status === "CONFIRMED")
    .reduce((sum, f) => sum + f.feeAmount, 0);

  const totalPending = fees
    .filter((f) => f.status === "PENDING" || f.status === "SUBMITTED")
    .reduce((sum, f) => sum + f.feeAmount, 0);

  const totalOverdue = fees
    .filter((f) => f.status === "OVERDUE")
    .reduce((sum, f) => sum + f.feeAmount, 0);

  return NextResponse.json({ fees, totalCollected, totalPending, totalOverdue });
}
