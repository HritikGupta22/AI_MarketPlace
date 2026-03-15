"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

type Props = {
  productId: string;
  sellerId: string;
  sellerName: string;
  productTitle: string;
  productPrice: number;
  productDescription: string;
};

export default function ChatButton({ productId, sellerId, sellerName, productTitle, productPrice, productDescription }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleChat() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    const roomId = `${session.user.id}_${sellerId}_${productId}`;
    const params = new URLSearchParams({
      sellerName,
      productTitle,
      productPrice: String(productPrice),
      productDescription,
    });
    router.push(`/chat/${roomId}?${params.toString()}`);
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleChat}>
      <MessageCircle className="size-4 mr-1" /> Chat with Seller
    </Button>
  );
}
