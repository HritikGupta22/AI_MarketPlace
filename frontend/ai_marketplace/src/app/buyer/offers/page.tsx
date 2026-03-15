"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins } from "lucide-react";

type Offer = {
  id: string;
  amount: number;
  quantity: number;
  status: string;
  counterAmount: number | null;
  expiresAt: string;
  createdAt: string;
  product: { id: string; title: string; price: number; images: string[] };
  buyer: { id: string; name: string };
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COUNTERED: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-muted text-muted-foreground",
};

export default function BuyerOffersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function respondToCounter(offerId: string, action: "buyer_accept" | "buyer_reject") {
    setActing(offerId + action);
    const res = await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: updated.status } : o)));
    }
    setActing(null);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Expire old offers first
    fetch("/api/offers/expire", { method: "POST" }).finally(() => {
      fetch("/api/offers")
        .then((r) => r.json())
        .then((data) => { setOffers(data); setLoading(false); });
    });
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Offers</h1>
        <p className="text-sm text-muted-foreground">Track your price offers to sellers</p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <HandCoins className="size-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No offers sent yet.</p>
            <Link href="/products">
              <Button variant="outline">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {offer.product.images[0] && (
                    <img src={offer.product.images[0]} className="size-12 rounded-lg object-cover" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${offer.product.id}`}>
                      <p className="font-medium text-sm hover:underline truncate">{offer.product.title}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground">Listed: ₹{offer.product.price.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[offer.status]}`}>
                    {offer.status}
                  </span>
                </div>

                <div className="text-sm space-y-0.5 pl-1">
                  <p>Your offer: <span className="font-semibold">₹{offer.amount.toLocaleString()}/item</span> × {offer.quantity} = <span className="font-semibold">₹{(offer.amount * offer.quantity).toLocaleString()}</span></p>
                  {offer.status === "COUNTERED" && offer.counterAmount && (
                    <>
                      <p className="text-blue-600">Seller countered: <span className="font-semibold">₹{offer.counterAmount.toLocaleString()}/item</span> × {offer.quantity} = <span className="font-semibold">₹{(offer.counterAmount * offer.quantity).toLocaleString()}</span></p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" disabled={!!acting} onClick={() => respondToCounter(offer.id, "buyer_accept")}>
                          {acting === offer.id + "buyer_accept" ? "..." : "Accept Counter"}
                        </Button>
                        <Button size="sm" variant="outline" disabled={!!acting} onClick={() => respondToCounter(offer.id, "buyer_reject")}>
                          {acting === offer.id + "buyer_reject" ? "..." : "Reject"}
                        </Button>
                      </div>
                    </>
                  )}
                  {offer.status === "ACCEPTED" && (
                    <p className="text-green-600 font-medium">🎉 Offer accepted! Proceed to checkout.</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {offer.status === "PENDING"
                      ? `Expires: ${new Date(offer.expiresAt).toLocaleString()}`
                      : `Updated: ${new Date(offer.createdAt).toLocaleDateString()}`}
                  </p>
                  {offer.status === "ACCEPTED" && (
                    <Link href={`/checkout?offerId=${offer.id}&offerPrice=${offer.counterAmount ?? offer.amount}&productId=${offer.product.id}&productTitle=${encodeURIComponent(offer.product.title)}&quantity=${offer.quantity}`}>
                      <Button size="sm">Buy Now ₹{((offer.counterAmount ?? offer.amount) * offer.quantity).toLocaleString()}</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
