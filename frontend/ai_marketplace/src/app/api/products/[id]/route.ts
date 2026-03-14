import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: { select: { id: true, name: true, image: true } },
      reviews: { include: { user: { select: { name: true, image: true } } } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(product);
}

// PATCH /api/products/[id] — seller updates own product
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (product.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.price && { price: parseFloat(data.price) }),
      ...(data.stock !== undefined && { stock: parseInt(data.stock) }),
      ...(data.images && { images: data.images }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.approved !== undefined && session.user.role === "ADMIN" && { approved: data.approved }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/products/[id] — seller deletes own product
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (product.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}
