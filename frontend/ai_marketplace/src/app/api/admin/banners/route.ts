import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, title, subtitle, imageUrl, link, color, active, order } = await req.json();
  if (!label || !title || !imageUrl)
    return NextResponse.json({ error: "label, title, imageUrl required" }, { status: 400 });

  const banner = await prisma.banner.create({
    data: { label, title, subtitle: subtitle ?? "", imageUrl, link: link ?? "/products", color: color ?? "from-slate-900 to-slate-700", active: active ?? true, order: order ?? 0 },
  });
  return NextResponse.json(banner, { status: 201 });
}
