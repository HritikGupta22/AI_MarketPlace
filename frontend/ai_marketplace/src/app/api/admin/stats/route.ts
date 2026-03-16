import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalUsers, totalSellers, totalProducts, pendingProducts, totalOrders, revenueAgg, totalReviews, hiddenReviews] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.product.count(),
      prisma.product.count({ where: { approved: false } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.review.count(),
      prisma.review.count({ where: { hidden: true } }),
    ]);

  return NextResponse.json({
    totalUsers,
    totalSellers,
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue: revenueAgg._sum.total ?? 0,
    totalReviews,
    hiddenReviews,
  });
}
