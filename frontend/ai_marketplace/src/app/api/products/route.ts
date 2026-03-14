import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

// GET /api/products — public listing with search + filter
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;

  const where = {
    approved: true,
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
    ...(category && { category: { slug: category } }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, seller: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) });
}

// POST /api/products — seller creates product
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, price, stock, categoryId, images } = await req.json();

  if (!title || !description || !price || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      stock: parseInt(stock ?? "0"),
      images: images ?? [],
      categoryId,
      sellerId: session.user.id,
      approved: false,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
