import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { title: true, images: true } } } },
      buyer: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center space-y-2">
          <CheckCircle className="size-12 text-green-600 mx-auto" />
          <h2 className="text-xl font-bold text-green-800">Order Placed Successfully!</h2>
          <p className="text-sm text-green-700">A confirmation email has been sent to {order.buyer.email}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
              order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {order.status}
            </span>
          </div>

          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {item.product.images[0] && (
                  <img src={item.product.images[0]} alt="" className="size-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.title}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                </div>
                <p className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total Paid</span>
            <span>₹{order.total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/orders" className="flex-1">
          <Button variant="outline" className="w-full">My Orders</Button>
        </Link>
        <Link href="/products" className="flex-1">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
