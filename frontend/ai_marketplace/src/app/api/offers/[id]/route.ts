import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, counterAmount } = await req.json();

  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  // Buyer accepting/rejecting a counter offer
  if (action === "buyer_accept" || action === "buyer_reject") {
    if (offer.buyerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (offer.status !== "COUNTERED") return NextResponse.json({ error: "No counter offer to respond to" }, { status: 400 });
    const updated = await prisma.offer.update({
      where: { id },
      data: { status: action === "buyer_accept" ? "ACCEPTED" : "REJECTED" },
    });
    return NextResponse.json(updated);
  }

  // Only seller can accept/reject/counter
  if (offer.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Offer is no longer pending" }, { status: 400 });
  }

  if (new Date() > offer.expiresAt) {
    await prisma.offer.update({ where: { id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Offer has expired" }, { status: 400 });
  }

  if (action === "accept") {
    const updated = await prisma.offer.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const updated = await prisma.offer.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json(updated);
  }

  if (action === "counter") {
    if (!counterAmount) return NextResponse.json({ error: "Counter amount required" }, { status: 400 });
    const updated = await prisma.offer.update({
      where: { id },
      data: { status: "COUNTERED", counterAmount },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
