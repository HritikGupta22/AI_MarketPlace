import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json(); // "confirm" | "reject" | "waive"

  const statusMap: Record<string, string> = {
    confirm: "CONFIRMED",
    reject: "PENDING",   // reject UTR → back to PENDING so seller resubmits
    waive: "WAIVED",
  };

  if (!statusMap[action])
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const updated = await prisma.platformFee.update({
    where: { id },
    data: {
      status: statusMap[action] as any,
      ...(action === "reject" ? { utr: null, paidAt: null } : {}),
    },
    include: { seller: { select: { name: true, email: true } } },
  });

  return NextResponse.json(updated);
}
