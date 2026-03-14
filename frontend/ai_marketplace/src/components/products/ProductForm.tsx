"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CldUploadWidget } from "next-cloudinary";
import { X, ImagePlus } from "lucide-react";

type Category = { id: string; name: string };

type Props = {
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  };
};

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price?.toString() ?? "",
    stock: initialData?.stock?.toString() ?? "",
    categoryId: initialData?.categoryId ?? "",
  });
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/products/${initialData.id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    } else {
      router.push("/seller/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Product" : "Add New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Product Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Product Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full min-h-24 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Price (₹)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                min="0"
                step="0.01"
                required
              />
              <Input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                min="0"
                required
              />
            </div>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Image Upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Product Images</p>
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative size-20">
                    <img src={img} alt="" className="size-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 size-5 bg-destructive text-white rounded-full flex items-center justify-center"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "ml_default"}
                    onSuccess={(result: any) => {
                      setImages((prev) => [...prev, result.info.secure_url]);
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="size-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
                      >
                        <ImagePlus className="size-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </button>
                    )}
                  </CldUploadWidget>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
