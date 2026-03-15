"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandCoins } from "lucide-react";

type Props = { productId: string; productPrice: number; productStock: number };

export default function MakeOfferButton({ productId, productPrice, productStock }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const parsedAmount = parseFloat(amount);
  const parsedQty = parseInt(quantity);
  const totalOffer = parsedAmount * parsedQty;
  const totalListed = productPrice * parsedQty;

  async function handleSubmit() {
    if (!session) { router.push("/auth/login"); return; }
    if (!parsedAmount || parsedAmount <= 0) { setMessage({ text: "Enter a valid offer price", ok: false }); return; }
    if (!parsedQty || parsedQty <= 0) { setMessage({ text: "Quantity must be at least 1", ok: false }); return; }
    if (parsedQty > productStock) { setMessage({ text: `Only ${productStock} items in stock`, ok: false }); return; }
    if (parsedAmount >= productPrice) { setMessage({ text: "Offer price must be less than listed price", ok: false }); return; }

    setLoading(true);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, amount: parsedAmount, quantity: parsedQty }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ text: data.error ?? "Failed to send offer", ok: false });
    } else {
      setMessage({ text: "Offer sent! Seller will respond within 24h.", ok: true });
      setAmount("");
      setQuantity("1");
      setTimeout(() => { setOpen(false); setMessage(null); }, 3000);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <HandCoins className="size-4 mr-1" /> Make an Offer
      </Button>
    );
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">Make an Offer</p>
        <button onClick={() => { setOpen(false); setMessage(null); }} className="text-xs text-muted-foreground hover:underline">Cancel</button>
      </div>

      <p className="text-xs text-muted-foreground">Listed price: ₹{productPrice.toLocaleString()} · Stock: {productStock}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Price per item</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
            <Input
              type="number"
              placeholder="Your price"
              value={amount}
              min={1}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || parseFloat(val) > 0) setAmount(val);
              }}
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Quantity</p>
          <Input
            type="number"
            placeholder="Qty"
            value={quantity}
            min={1}
            max={productStock}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseInt(val) > 0) setQuantity(val);
            }}
          />
        </div>
      </div>

      {parsedAmount > 0 && parsedQty > 0 && (
        <div className="bg-muted rounded-lg px-3 py-2 text-xs space-y-0.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your total offer</span>
            <span className="font-semibold">₹{totalOffer.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Listed total</span>
            <span>₹{totalListed.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">You save</span>
            <span className="text-green-600 font-medium">₹{(totalListed - totalOffer).toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button className="w-full" onClick={handleSubmit} disabled={loading || !amount || !quantity}>
        {loading ? "Sending..." : "Send Offer"}
      </Button>

      {message && (
        <p className={`text-xs ${message.ok ? "text-green-600" : "text-destructive"}`}>{message.text}</p>
      )}
    </div>
  );
}
