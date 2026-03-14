"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense } from "react";

type Product = {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: { name: string; slug: string };
  seller: { name: string };
};

type Category = { id: string; name: string; slug: string };

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = searchParams.get("page") ?? "1";

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("page", page);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
        setLoading(false);
      });
  }, [search, category, page]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            defaultValue={search}
            className="pl-8"
            onChange={(e) => {
              const val = e.target.value;
              const t = setTimeout(() => updateParam("search", val), 500);
              return () => clearTimeout(t);
            }}
          />
        </div>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">{total} products found</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="aspect-square overflow-hidden rounded-t-xl bg-muted">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                  )}
                </div>
                <CardContent className="p-3 space-y-1">
                  <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.category.name}</p>
                  <p className="font-bold text-sm">₹{product.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">by {product.seller.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={page === String(i + 1) ? "default" : "outline"}
              onClick={() => updateParam("page", String(i + 1))}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
