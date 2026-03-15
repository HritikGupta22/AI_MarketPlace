"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

type Props = {
  productId: string;
  sellerId: string;
  sellerName: string;
};

export default function ChatButton({ productId, sellerId, sellerName }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleChat() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    // roomId = buyerId_sellerId_productId
    const roomId = `${session.user.id}_${sellerId}_${productId}`;
    router.push(`/chat/${roomId}?sellerName=${encodeURIComponent(sellerName)}`);
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleChat}>
      <MessageCircle className="size-4 mr-1" /> Chat with Seller
    </Button>
  );
}
