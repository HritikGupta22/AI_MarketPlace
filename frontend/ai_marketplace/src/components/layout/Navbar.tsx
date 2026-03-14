"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Store } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const { data: session } = useSession();
  const count = useCartStore((s) => s.count());

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
                <Link href="/seller/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              )}
              <Link href="/orders">
                <Button variant="ghost" size="sm">Orders</Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="size-4" />
                  {count > 0 && (
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
                  {count > 0 && (
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
