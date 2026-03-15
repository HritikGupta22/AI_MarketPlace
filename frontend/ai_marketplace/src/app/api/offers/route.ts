import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

// POST — buyer creates an offer
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, amount, quantity = 1 } = await req.json();
  if (!productId || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  if (quantity <= 0) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Check for existing pending offer
  const existing = await prisma.offer.findFirst({
    where: { productId, buyerId: session.user.id, status: "PENDING" },
  });
  if (existing) return NextResponse.json({ error: "You already have a pending offer" }, { status: 400 });

  const offer = await prisma.offer.create({
    data: {
      amount,
      quantity,
      productId,
      buyerId: session.user.id,
      sellerId: product.sellerId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json(offer, { status: 201 });
}

// GET — list offers (buyer sees own, seller sees received)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSeller = session.user.role === "SELLER";

  const offers = await prisma.offer.findMany({
    where: isSeller ? { sellerId: session.user.id } : { buyerId: session.user.id },
    include: {
      product: { select: { id: true, title: true, price: true, images: true } },
      buyer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}
