import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id === session.user.id)
    return NextResponse.json({ error: "Cannot modify yourself" }, { status: 400 });

  const { banned, role } = await req.json();
  const data: Record<string, unknown> = {};
  if (banned !== undefined) data.banned = Boolean(banned);
  if (role !== undefined) data.role = role;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, banned: true, role: true },
  });

  return NextResponse.json(user);
}
