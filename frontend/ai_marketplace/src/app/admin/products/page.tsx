"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Trash2, ExternalLink } from "lucide-react";

type Product = {
  id: string; title: string; price: number; stock: number; approved: boolean; images: string[];
  seller: { name: string | null; email: string };
  category: { name: string };
  _count: { reviews: number; orderItems: number };
};

const FILTERS = ["all", "pending", "approved"] as const;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products?filter=${filter}`).then((r) => r.json()).then((d) => { setProducts(d); setLoading(false); });
  }, [filter]);

  async function approve(id: string, approved: boolean) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (res.ok) setProducts((prev) => prev.map((p) => p.id === id ? { ...p, approved } : p));
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Approve, reject or delete products</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : products.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No products found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${p.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.category.name} · ₹{p.price.toLocaleString()} · Stock: {p.stock}</p>
                  <p className="text-xs text-muted-foreground">By {p.seller.name} ({p.seller.email}) · {p._count.reviews} reviews · {p._count.orderItems} orders</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/products/${p.id}`} target="_blank">
                    <Button variant="ghost" size="icon"><ExternalLink className="size-4" /></Button>
                  </Link>
                  {!p.approved ? (
                    <Button size="sm" onClick={() => approve(p.id, true)}>
                      <CheckCircle className="size-3 mr-1" /> Approve
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => approve(p.id, false)}>
                      <Clock className="size-3 mr-1" /> Revoke
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
