import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, total, address, upiRef } = await req.json();

  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  // Resolve sellerId from the first item's product
  const firstProduct = await prisma.product.findUnique({
    where: { id: items[0].id },
    select: { sellerId: true },
  });
  if (!firstProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Create order with items
  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      sellerId: firstProduct.sellerId,
      total,
      status: "PENDING",
      items: {
        create: items.map((item: { id: string; price: number; quantity: number }) => ({
          productId: item.id,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  // Send confirmation email
  await resend.emails.send({
    from: "AI Marketplace <onboarding@resend.dev>",
    to: session.user.email!,
    subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Order Confirmed! 🎉</h2>
        <p>Hi ${session.user.name}, your order has been placed successfully.</p>
        <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Total:</strong> ₹${total.toLocaleString()}</p>
        <h3>Items:</h3>
        <ul>
          ${order.items.map((i) => `<li>${i.product.title} x${i.quantity} — ₹${(i.price * i.quantity).toLocaleString()}</li>`).join("")}
        </ul>
        <p style="color:#666;font-size:14px;">Thank you for shopping with AI Marketplace!</p>
      </div>
    `,
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { items: { include: { product: { select: { title: true, images: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
