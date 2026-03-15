import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ count: 0 });
  }

  const sellerId = session.user.id;

  // Get latest message per room for this seller
  const messages = await prisma.message.findMany({
    where: { receiverId: sellerId },
    orderBy: { createdAt: "desc" },
    select: { roomId: true, createdAt: true },
  });

  // Deduplicate — latest per room
  const roomMap = new Map<string, Date>();
  for (const msg of messages) {
    if (!roomMap.has(msg.roomId)) roomMap.set(msg.roomId, msg.createdAt);
  }

  const rooms = Array.from(roomMap.entries()).map(([roomId, lastMessageAt]) => ({
    roomId,
    lastMessageAt,
  }));

  return NextResponse.json({ rooms });
}
