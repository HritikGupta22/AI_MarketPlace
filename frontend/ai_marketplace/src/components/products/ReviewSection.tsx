"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  sentiment: string;
  createdAt: string;
  user: { name: string | null; image: string | null };
};

const SENTIMENT_STYLES: Record<string, string> = {
  POSITIVE: "bg-green-100 text-green-700",
  NEUTRAL: "bg-yellow-100 text-yellow-700",
  NEGATIVE: "bg-red-100 text-red-700",
};

export default function ReviewSection({ productId, initialReviews }: { productId: string; initialReviews: Review[] }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasReviewed = reviews.some((r) => r.user.name === session?.user?.name);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed"); }
    else { setReviews((prev) => [data, ...prev]); setComment(""); setRating(5); }
    setSubmitting(false);
  }

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-lg font-bold">Reviews ({reviews.length})</h2>

      {session && !hasReviewed && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submitReview} className="space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)}
                    className={`text-xl ${s <= rating ? "text-yellow-400" : "text-muted-foreground"}`}>
                    ★
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>
              </div>
              <textarea
                placeholder="Share your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-16 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm resize-none outline-none focus-visible:border-ring"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{review.user.name}</p>
                <div className="flex items-center gap-2">
                  {review.sentiment && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SENTIMENT_STYLES[review.sentiment] ?? "bg-muted text-muted-foreground"}`}>
                      {review.sentiment}
                    </span>
                  )}
                  <p className="text-sm">{"⭐".repeat(review.rating)}</p>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
