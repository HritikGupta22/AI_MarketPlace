"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  buyer: { name: string | null; email: string };
  items: {
    quantity: number;
    price: number;
    product: { title: string; images: string[] };
  }[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: "Confirm Order",
  CONFIRMED: "Mark as Shipped",
  SHIPPED: "Mark as Delivered",
};

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/seller/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, [status]);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdating(null);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Incoming Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="size-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.buyer.name ?? order.buyer.email}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>
                      {order.status}
                    </span>
                    <p className="font-bold text-sm">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt="" className="size-8 rounded object-cover" />
                      )}
                      <span className="flex-1 line-clamp-1">{item.product.title}</span>
                      <span className="text-muted-foreground text-xs">x{item.quantity} · ₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {NEXT_STATUS[order.status] && (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={updating === order.id}
                    onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                  >
                    {updating === order.id ? "Updating..." : NEXT_LABEL[order.status]}
                  </Button>
                )}

                {order.status === "DELIVERED" && (
                  <p className="text-xs text-center text-green-600 font-medium">✅ Order completed</p>
                )}
                {order.status === "CANCELLED" && (
                  <p className="text-xs text-center text-red-500 font-medium">❌ Order cancelled by buyer</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
