import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

// GET — seller's fee history + current month earnings preview
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // getMonth() is 0-indexed
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  // Calculate last month's earnings from orders
  const startOfLastMonth = new Date(lastMonthYear, lastMonth - 1, 1);
  const endOfLastMonth = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);

  const orders = await prisma.orderItem.findMany({
    where: {
      product: { sellerId: session.user.id },
      order: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    },
    select: { price: true, quantity: true },
  });

  const lastMonthEarnings = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const feeAmount = parseFloat((lastMonthEarnings * 0.02).toFixed(2));
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 5); // 5th of current month

  // Upsert fee record for last month
  if (lastMonthEarnings > 0) {
    await prisma.platformFee.upsert({
      where: { sellerId_month_year: { sellerId: session.user.id, month: lastMonth, year: lastMonthYear } },
      create: { sellerId: session.user.id, month: lastMonth, year: lastMonthYear, earnings: lastMonthEarnings, feeAmount, dueDate },
      update: { earnings: lastMonthEarnings, feeAmount },
    });
  }

  // Mark overdue — if today > 5th and fee still PENDING
  if (now.getDate() > 5) {
    await prisma.platformFee.updateMany({
      where: { sellerId: session.user.id, status: "PENDING", dueDate: { lt: now } },
      data: { status: "OVERDUE" },
    });
  }

  const fees = await prisma.platformFee.findMany({
    where: { sellerId: session.user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json({ fees, lastMonthEarnings, feeAmount, lastMonth, lastMonthYear, dueDate });
}
