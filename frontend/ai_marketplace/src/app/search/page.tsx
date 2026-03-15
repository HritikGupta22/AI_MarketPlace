"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanSearch, Upload, X } from "lucide-react";

type Result = { id: string; title: string; price: number; images: string[]; caption?: string };

export default function VisualSearchPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults([]);
    setSearched(false);
  }

  async function search() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/search/visual", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Search failed"); setResults([]); }
      else setResults(Array.isArray(data) ? data : []);
    } catch {
      setError("Search failed. Please try again.");
    }
    setSearched(true);
    setLoading(false);
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScanSearch className="size-6" /> Visual Search
        </h1>
        <p className="text-sm text-muted-foreground">Upload an image to find visually similar products</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {!preview ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
            </button>
          ) : (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-xl border" />
              <button onClick={clear} className="absolute top-2 right-2 size-7 bg-destructive text-white rounded-full flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <Button onClick={search} disabled={!file || loading} className="w-full">
            {loading ? "Searching..." : "Search by Image"}
          </Button>
        </CardContent>
      </Card>

      {searched && (
        <div className="space-y-3">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <>
              {results[0]?.caption && (
                <p className="text-xs text-muted-foreground">AI understood: <span className="italic">"{results[0].caption}"</span></p>
              )}
              <p className="text-sm font-medium">{results.length > 0 ? `${results.length} similar products found` : "No similar products found"}</p>
            </>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                    <p className="text-sm font-bold">₹{p.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
