"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    quantity: number;
    price: number;
    product: { title: string; images: string[] };
  }[];
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, [status]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="size-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No orders yet</p>
          <Link href="/products"><Button>Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status}
                    </span>
                    <p className="font-bold text-sm mt-1">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {order.items.map((item, i) => (
                    <div key={i} className="shrink-0 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt="" className="size-8 rounded object-cover" />
                      )}
                      <div>
                        <p className="text-xs font-medium line-clamp-1 max-w-32">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
