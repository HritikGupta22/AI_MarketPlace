"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type Review = {
  id: string; rating: number; comment: string | null; sentiment: string; hidden: boolean; createdAt: string;
  user: { name: string | null; email: string };
  product: { id: string; title: string };
};

const SENTIMENT_STYLES: Record<string, string> = {
  POSITIVE: "bg-green-100 text-green-700",
  NEUTRAL: "bg-yellow-100 text-yellow-700",
  NEGATIVE: "bg-red-100 text-red-700",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hidden">("all");

  useEffect(() => {
    fetch("/api/admin/reviews").then((r) => r.json()).then((d) => { setReviews(d); setLoading(false); });
  }, []);

  async function toggleHide(id: string, hidden: boolean) {
    const res = await fetch(`/api/reviews/${id}/hide`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
    if (res.ok) setReviews((prev) => prev.map((r) => r.id === id ? { ...r, hidden } : r));
  }

  const filtered = filter === "hidden" ? reviews.filter((r) => r.hidden) : reviews;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">Moderate user reviews</p>
        </div>
        <div className="flex gap-2">
          {(["all", "hidden"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No reviews found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className={r.hidden ? "opacity-60 border-dashed" : ""}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{r.user.name ?? r.user.email}</p>
                    <span className="text-xs text-muted-foreground">on</span>
                    <Link href={`/products/${r.product.id}`} target="_blank" className="text-sm text-primary hover:underline truncate max-w-48">
                      {r.product.title}
                    </Link>
                    {r.sentiment && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SENTIMENT_STYLES[r.sentiment] ?? "bg-muted text-muted-foreground"}`}>
                        {r.sentiment}
                      </span>
                    )}
                    {r.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">HIDDEN</span>}
                  </div>
                  <p className="text-sm">{"⭐".repeat(r.rating)}</p>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/products/${r.product.id}`} target="_blank">
                    <Button variant="ghost" size="icon"><ExternalLink className="size-4" /></Button>
                  </Link>
                  <Button size="sm" variant={r.hidden ? "default" : "outline"} onClick={() => toggleHide(r.id, !r.hidden)}>
                    {r.hidden ? "Unhide" : "Hide"}
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
