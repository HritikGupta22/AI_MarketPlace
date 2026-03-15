"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Store } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "seller_chats_last_seen";

export default function Navbar() {
  const { data: session } = useSession();
  const count = useCartStore((s) => s.count());
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => setMounted(true), []);

  const fetchUnread = useCallback(async () => {
    if (!session || session.user.role !== "SELLER") return;
    try {
      const res = await fetch("/api/seller/chats/unread");
      const data = await res.json();
      const lastSeen: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      let unread = 0;
      for (const room of data.rooms ?? []) {
        const seenAt = lastSeen[room.roomId];
        if (!seenAt || new Date(room.lastMessageAt) > new Date(seenAt)) unread++;
      }
      setUnreadCount(unread);
    } catch {}
  }, [session]);

  useEffect(() => {
    if (!mounted) return;
    fetchUnread();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [mounted, fetchUnread]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Store className="size-5" />
          AI Marketplace
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="ghost" size="sm">Browse</Button>
          </Link>

          {session ? (
            <>
              {session.user.role === "SELLER" && (
                <>
                  <Link href="/seller/dashboard">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Link href="/seller/chats" onClick={() => {
                    // Mark all rooms as seen on click
                    fetch("/api/seller/chats/unread")
                      .then(r => r.json())
                      .then(data => {
                        const lastSeen: Record<string, string> = {};
                        for (const room of data.rooms ?? []) {
                          lastSeen[room.roomId] = room.lastMessageAt;
                        }
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(lastSeen));
                        setUnreadCount(0);
                      });
                  }}>
                    <Button variant="ghost" size="sm" className="relative">
                      Messages
                      {unreadCount > 0 && mounted && (
                        <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/orders">
                <Button variant="ghost" size="sm">Orders</Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="size-4" />
                  {count > 0 && mounted && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="size-4" />
                  {count > 0 && mounted && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
