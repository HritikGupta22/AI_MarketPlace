"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Clock, CheckCircle, MessageCircle, HandCoins, AlertTriangle, IndianRupee } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  approved: boolean;
  images: string[];
  category: { name: string };
};

type FeeData = {
  fees: { id: string; month: number; year: number; earnings: number; feeAmount: number; status: string; utr: string | null; dueDate: string }[];
  lastMonthEarnings: number;
  feeAmount: number;
  lastMonth: number;
  lastMonthYear: number;
  dueDate: string;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const FEE_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  WAIVED: "bg-muted text-muted-foreground",
};

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [utrInput, setUtrInput] = useState<Record<string, string>>({});
  const [submittingFee, setSubmittingFee] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/seller/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
    fetch("/api/seller/fees")
      .then((r) => r.json())
      .then((data) => { if (data && !data.error) setFeeData(data); });
  }, [status]);

  async function submitFeePayment(feeId: string) {
    const utr = utrInput[feeId];
    if (!utr?.trim()) return;
    setSubmittingFee(feeId);
    const res = await fetch("/api/seller/fees/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feeId, utr }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFeeData((prev) => prev ? {
        ...prev,
        fees: prev.fees.map((f) => f.id === feeId ? { ...f, status: updated.status, utr: updated.utr } : f),
      } : prev);
    }
    setSubmittingFee(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your products</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/seller/chats">
            <Button variant="outline"><MessageCircle className="size-4 mr-1" /> Messages</Button>
          </Link>
          <Link href="/seller/offers">
            <Button variant="outline"><HandCoins className="size-4 mr-1" /> Offers</Button>
          </Link>
          <Link href="/seller/products/new">
            <Button><Plus className="size-4 mr-1" /> Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-3xl font-bold text-green-600">{products.filter(p => p.approved).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-600">{products.filter(p => !p.approved).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Fee Section */}
      {feeData && feeData.lastMonthEarnings > 0 && (() => {
        const due = feeData.fees.find((f) => f.month === feeData.lastMonth && f.year === feeData.lastMonthYear);
        const isOverdue = due?.status === "OVERDUE";
        const isPending = due?.status === "PENDING" || !due;
        const isSubmitted = due?.status === "SUBMITTED";
        const isConfirmed = due?.status === "CONFIRMED";
        return (
          <Card className={`border-2 ${isOverdue ? "border-red-400" : isConfirmed ? "border-green-400" : "border-yellow-400"}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="size-4 text-primary" />
                  <p className="font-semibold text-sm">Platform Fee — {MONTHS[feeData.lastMonth - 1]} {feeData.lastMonthYear}</p>
                </div>
                {due && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${FEE_STATUS_STYLES[due.status]}`}>{due.status}</span>}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Last Month Earnings</p>
                  <p className="font-bold text-sm">₹{feeData.lastMonthEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">2% Fee Due</p>
                  <p className="font-bold text-sm text-primary">₹{feeData.feeAmount.toLocaleString()}</p>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Pay By</p>
                  <p className={`font-bold text-sm ${isOverdue ? "text-red-600" : "text-foreground"}`}>
                    {new Date(feeData.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              {isOverdue && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <p className="text-xs">Payment overdue! Admin has been notified. Please pay immediately to avoid action.</p>
                </div>
              )}

              {(isPending || isOverdue) && due && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Pay <span className="font-semibold text-foreground">₹{feeData.feeAmount}</span> to UPI: <span className="font-mono font-semibold">hritikguptak@paytm</span></p>
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter UTR / Transaction ID"
                      value={utrInput[due.id] ?? ""}
                      onChange={(e) => setUtrInput((prev) => ({ ...prev, [due.id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
                    />
                    <Button size="sm" disabled={submittingFee === due.id || !utrInput[due.id]?.trim()} onClick={() => submitFeePayment(due.id)}>
                      {submittingFee === due.id ? "Submitting..." : "Submit Payment"}
                    </Button>
                  </div>
                </div>
              )}

              {isSubmitted && (
                <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                  ✅ Payment submitted (UTR: <span className="font-mono">{due?.utr}</span>). Waiting for admin confirmation.
                </div>
              )}

              {isConfirmed && (
                <div className="text-xs text-green-600 bg-green-50 rounded-lg p-2">
                  ✅ Payment confirmed by admin. Thank you!
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Fee History */}
      {feeData && feeData.fees.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Fee History</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {feeData.fees.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{MONTHS[f.month - 1]} {f.year}</span>
                <span>₹{f.earnings.toLocaleString()} earned → <span className="font-medium">₹{f.feeAmount} fee</span></span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${FEE_STATUS_STYLES[f.status]}`}>{f.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-muted-foreground">No products yet.</p>
            <Link href="/seller/products/new">
              <Button><Plus className="size-4 mr-1" /> Add Your First Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Your Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.title} className="size-12 rounded-md object-cover" />
                    ) : (
                      <div className="size-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{product.category.name} · ₹{product.price} · Stock: {product.stock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.approved ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="size-3" /> Approved</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="size-3" /> Pending</span>
                    )}
                    <Link href={`/seller/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
