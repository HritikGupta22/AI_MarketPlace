"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function SellerOffersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterInputs, setCounterInputs] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/offers/expire", { method: "POST" }).finally(() => {
      fetch("/api/offers")
        .then((r) => r.json())
        .then((data) => { setOffers(data); setLoading(false); });
    });
  }, [status]);

  async function handleAction(offerId: string, action: string, counterAmount?: number) {
    setActing(offerId + action);
    const res = await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, counterAmount }),
    });
    const updated = await res.json();
    if (res.ok) setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, ...updated } : o));
    setActing(null);
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const pending = offers.filter((o) => o.status === "PENDING");
  const others = offers.filter((o) => o.status !== "PENDING");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Offers Received</h1>
        <p className="text-sm text-muted-foreground">Manage buyer price offers</p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <HandCoins className="size-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No offers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Pending ({pending.length})</p>
              {pending.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {offer.product.images[0] && (
                        <img src={offer.product.images[0]} className="size-12 rounded-lg object-cover" alt="" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{offer.product.title}</p>
                        <p className="text-xs text-muted-foreground">Listed: ₹{offer.product.price.toLocaleString()} · Qty: {offer.quantity}</p>
                        <p className="text-xs text-muted-foreground">From: {offer.buyer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{offer.amount.toLocaleString()}<span className="text-xs font-normal text-muted-foreground"> /item</span></p>
                        <p className="text-xs text-muted-foreground">Total: ₹{(offer.amount * offer.quantity).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((offer.amount / offer.product.price) * 100)}% of price
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700"
                        disabled={acting === offer.id + "accept"}
                        onClick={() => handleAction(offer.id, "accept")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="destructive"
                        disabled={acting === offer.id + "reject"}
                        onClick={() => handleAction(offer.id, "reject")}>
                        Reject
                      </Button>
                      <div className="flex gap-1 flex-1">
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            placeholder="Counter price"
                            className="pl-6 h-8 text-sm"
                            value={counterInputs[offer.id] ?? ""}
                            onChange={(e) => setCounterInputs((p) => ({ ...p, [offer.id]: e.target.value }))}
                          />
                        </div>
                        <Button size="sm" variant="outline"
                          disabled={acting === offer.id + "counter" || !counterInputs[offer.id]}
                          onClick={() => handleAction(offer.id, "counter", parseFloat(counterInputs[offer.id]))}>
                          Counter
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Expires: {new Date(offer.expiresAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">History</p>
              {others.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {offer.product.images[0] && (
                      <img src={offer.product.images[0]} className="size-10 rounded-lg object-cover" alt="" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{offer.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {offer.buyer.name} · ₹{offer.amount.toLocaleString()}/item · Qty: {offer.quantity}
                        {offer.counterAmount && ` → Counter: ₹${offer.counterAmount.toLocaleString()}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[offer.status]}`}>
                      {offer.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
