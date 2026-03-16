import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

const SELLER_TRANSITIONS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { name: true, email: true } },
      items: { include: { product: { select: { title: true, images: true } } } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isBuyer = session.user.id === order.buyerId;
  const isSeller = session.user.id === order.sellerId;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Buyer can only cancel a PENDING order
  if (isBuyer) {
    if (status !== "CANCELLED" || order.status !== "PENDING") {
      return NextResponse.json({ error: "You can only cancel a pending order" }, { status: 400 });
    }
  }

  // Seller can only move forward in the pipeline
  if (isSeller) {
    const expected = SELLER_TRANSITIONS[order.status];
    if (status !== expected) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
