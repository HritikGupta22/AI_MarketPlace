import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerId = session.user.id;

  // Get all messages where this seller is receiver, grouped by roomId
  const messages = await prisma.message.findMany({
    where: { receiverId: sellerId },
    orderBy: { createdAt: "desc" },
    select: {
      roomId: true,
      content: true,
      createdAt: true,
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  // Deduplicate by roomId — keep latest message per room
  const roomMap = new Map<string, (typeof messages)[0]>();
  for (const msg of messages) {
    if (!roomMap.has(msg.roomId)) roomMap.set(msg.roomId, msg);
  }

  const chats = Array.from(roomMap.values()).map((msg) => ({
    roomId: msg.roomId,
    buyerId: msg.sender.id,
    buyerName: msg.sender.name ?? "Buyer",
    buyerImage: msg.sender.image,
    lastMessage: msg.content,
    lastMessageAt: msg.createdAt,
    // extract productId from roomId: buyerId_sellerId_productId
    productId: msg.roomId.split("_")[2] ?? "",
  }));

  return NextResponse.json(chats);
}
