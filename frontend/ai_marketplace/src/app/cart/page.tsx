"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="size-16 text-muted-foreground" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm">Browse products and add them to your cart</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Cart ({items.length} items)</h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4">
                <div className="size-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground">by {item.sellerName}</p>
                  <p className="font-bold text-sm">₹{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-6"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-6"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 ml-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="font-bold text-sm shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-4 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span className="line-clamp-1 flex-1">{item.title} x{item.quantity}</span>
                    <span className="ml-2">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total().toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="block">
                <Button className="w-full">Proceed to Checkout</Button>
              </Link>
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
