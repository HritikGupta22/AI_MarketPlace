"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Clock, CheckCircle, MessageCircle, HandCoins } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  approved: boolean;
  images: string[];
  category: { name: string };
};

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/seller/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, [status]);

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
