"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

type Chat = {
  roomId: string;
  buyerId: string;
  buyerName: string;
  buyerImage: string | null;
  lastMessage: string;
  lastMessageAt: string;
  productId: string;
};

export default function SellerChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/seller/chats")
      .then((r) => r.json())
      .then((data) => { setChats(data); setLoading(false); });
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Conversations from buyers</p>
      </div>

      {chats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <MessageCircle className="size-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground">Buyers will appear here when they message you.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <Link key={chat.roomId} href={`/chat/${chat.roomId}?sellerName=${encodeURIComponent(session?.user?.name ?? "Seller")}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={chat.buyerImage ?? ""} />
                    <AvatarFallback>{chat.buyerName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{chat.buyerName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(chat.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
