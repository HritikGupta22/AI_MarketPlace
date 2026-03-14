"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().length(6, "Valid 6-digit pincode required"),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [upiStep, setUpiStep] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [copied, setCopied] = useState(false);

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
    if (items.length === 0 && status === "authenticated") router.push("/cart");
  }, [items, status, router]);

  function onSubmit(data: FormData) {
    setFormData(data);
    setUpiStep(true);
  }

  async function handlePlaceOrder() {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, price: i.price, quantity: i.quantity })),
        total: total(),
        address: formData,
      }),
    });

    setLoading(false);

    if (res.ok) {
      const { orderId } = await res.json();
      clearCart();
      router.push(`/orders/${orderId}?success=true`);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!upiStep ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Form */}
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

          {/* Order Summary */}
          <Card className="h-fit sticky top-20">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-bold">Order Summary</h2>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                  <span className="line-clamp-1 flex-1">{item.title} x{item.quantity}</span>
                  <span className="ml-2">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total().toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* UPI Payment Step */
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader><CardTitle className="text-center">Pay via UPI</CardTitle></CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold">₹{total().toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>

              {/* UPI ID display */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Pay to UPI ID</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-bold font-mono">9835459861@superyes</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("9835459861@superyes");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs text-primary underline shrink-0"
                  >
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* UPI App buttons — works on both Android & iOS */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Select your UPI app</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Google Pay",  href: `tez://upi/pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${total()}&cu=INR` },
                    { name: "PhonePe",     href: `phonepe://pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${total()}&cu=INR` },
                    { name: "Paytm",       href: `paytmmp://pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${total()}&cu=INR` },
                    { name: "BHIM",        href: `upi://pay?pa=9835459861@superyes&pn=AI+Marketplace&am=${total()}&cu=INR` },
                  ].map((app) => (
                    <a key={app.name} href={app.href}>
                      <Button variant="outline" className="w-full">{app.name}</Button>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  App not listed? Copy UPI ID above and pay manually.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">After completing payment, click below to confirm your order</p>
                <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Placing Order..." : "I have paid — Confirm Order"}
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setUpiStep(false)}>
                ← Back to Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
