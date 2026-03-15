"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().length(6, "Valid 6-digit pincode required"),
});

type FormData = z.infer<typeof schema>;

function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [upiStep, setUpiStep] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [copied, setCopied] = useState(false);

  // Offer-based checkout
  const offerId = searchParams.get("offerId");
  const offerPrice = searchParams.get("offerPrice");
  const offerProductId = searchParams.get("productId");
  const offerProductTitle = searchParams.get("productTitle");
  const offerQuantity = parseInt(searchParams.get("quantity") ?? "1");
  const isOfferCheckout = !!offerId && !!offerPrice;
  const checkoutTotal = isOfferCheckout ? parseFloat(offerPrice!) * offerQuantity : total();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login?callbackUrl=/checkout");
    if (session?.user) {
      setValue("name", session.user.name ?? "");
      setValue("email", session.user.email ?? "");
    }
  }, [status, session, router, setValue]);

  useEffect(() => {
    if (!isOfferCheckout && items.length === 0 && status === "authenticated") router.push("/cart");
  }, [items, status, router, isOfferCheckout]);

  function onSubmit(data: FormData) {
    setFormData(data);
    setUpiStep(true);
  }

  async function handlePlaceOrder() {
    setLoading(true);

    let orderItems;
    let orderTotal;

    if (isOfferCheckout && offerProductId && offerPrice) {
      orderItems = [{ id: offerProductId, price: parseFloat(offerPrice), quantity: offerQuantity }];
      orderTotal = parseFloat(offerPrice) * offerQuantity;
    } else {
      orderItems = items.map((i) => ({ id: i.id, price: i.price, quantity: i.quantity }));
      orderTotal = total();
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderItems, total: orderTotal, address: formData, offerId }),
    });

    setLoading(false);

    if (res.ok) {
      const { orderId } = await res.json();
      if (!isOfferCheckout) clearCart();
      router.push(`/orders/${orderId}?success=true`);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!upiStep ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader><CardTitle>Delivery Details</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Input placeholder="Full Name" {...register("name")} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input placeholder="Email" type="email" {...register("email")} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Input placeholder="Phone Number" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <textarea
                      placeholder="Full Address (House no, Street, Area)"
                      {...register("address")}
                      className="w-full min-h-20 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Input placeholder="City" {...register("city")} />
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input placeholder="Pincode" {...register("pincode")} maxLength={6} />
                      {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Continue to Payment</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit sticky top-20">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-bold">Order Summary</h2>
              {isOfferCheckout ? (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex-1 line-clamp-1">{offerProductTitle ?? "Negotiated Item"}</span>
                  <span className="ml-2">₹{checkoutTotal.toLocaleString()}</span>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                    <span className="line-clamp-1 flex-1">{item.title} x{item.quantity}</span>
                    <span className="ml-2">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))
              )}
              {isOfferCheckout && (
                <p className="text-xs text-green-600 font-medium">🎉 Negotiated price applied!</p>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{checkoutTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader><CardTitle className="text-center">Pay via UPI</CardTitle></CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold">₹{checkoutTotal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>

              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Pay to UPI ID</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-bold font-mono">9835459861@superyes</p>
                  <button type="button" onClick={() => { navigator.clipboard.writeText("9835459861@superyes"); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-xs text-primary underline shrink-0">
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Select your UPI app</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Google Pay", href: `tez://upi/pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${checkoutTotal}&cu=INR` },
                    { name: "PhonePe",    href: `phonepe://pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${checkoutTotal}&cu=INR` },
                    { name: "Paytm",      href: `paytmmp://pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${checkoutTotal}&cu=INR` },
                    { name: "BHIM",       href: `upi://pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${checkoutTotal}&cu=INR` },
                  ].map((app) => (
                    <a key={app.name} href={app.href}>
                      <Button variant="outline" className="w-full">{app.name}</Button>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">App not listed? Copy UPI ID above and pay manually.</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">After completing payment, click below to confirm your order</p>
                <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Placing Order..." : "I have paid — Confirm Order"}
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setUpiStep(false)}>← Back to Details</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
