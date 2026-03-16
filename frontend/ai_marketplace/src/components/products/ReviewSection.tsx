"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

type ReviewReply = {
  id: string;
  content: string;
  createdAt: string;
  seller: { name: string | null };
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  sentiment: string;
  helpful: number;
  notHelpful: number;
  hidden: boolean;
  createdAt: string;
  user: { name: string | null; image: string | null };
  reply: ReviewReply | null;
};

const SENTIMENT_STYLES: Record<string, string> = {
  POSITIVE: "bg-green-100 text-green-700",
  NEUTRAL: "bg-yellow-100 text-yellow-700",
  NEGATIVE: "bg-red-100 text-red-700",
};

export default function ReviewSection({
  productId,
  initialReviews,
  sellerId,
}: {
  productId: string;
  initialReviews: Review[];
  sellerId: string;
}) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, string>>({});

  const isSeller = session?.user?.id === sellerId;
  const isAdmin = session?.user?.role === "ADMIN";
  const hasReviewed = reviews.some((r) => r.user.name === session?.user?.name);

  useEffect(() => {
    if (reviews.length >= 2) loadSummary();
  }, []);

  async function loadSummary() {
    setSummaryLoading(true);
    const res = await fetch(`/api/reviews/summary?productId=${productId}`);
    const data = await res.json();
    setSummary(data.summary ?? null);
    setSummaryLoading(false);
  }

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
    else {
      setReviews((prev) => [data, ...prev]);
      setComment(""); setRating(5);
      if (reviews.length >= 1) loadSummary();
    }
    setSubmitting(false);
  }

  async function submitReply(reviewId: string) {
    const content = replyText[reviewId];
    if (!content?.trim()) return;
    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, reply: data } : r));
      setReplyingTo(null);
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    }
  }

  async function vote(reviewId: string, type: "helpful" | "notHelpful") {
    if (voted[reviewId]) return;
    const res = await fetch(`/api/reviews/${reviewId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: type }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, helpful: data.helpful, notHelpful: data.notHelpful } : r));
      setVoted((prev) => ({ ...prev, [reviewId]: type }));
    }
  }

  async function toggleHide(reviewId: string, hidden: boolean) {
    const res = await fetch(`/api/reviews/${reviewId}/hide`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, hidden } : r));
    }
  }

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-lg font-bold">Reviews ({reviews.filter((r) => !r.hidden || isAdmin).length})</h2>

      {/* AI Summary */}
      {(summary || summaryLoading) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-2">
            <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
              <p className="text-sm text-muted-foreground">{summaryLoading ? "Generating summary..." : summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {session && !hasReviewed && !isSeller && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submitReview} className="space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)}
                    className={`text-xl ${s <= rating ? "text-yellow-400" : "text-muted-foreground"}`}>★</button>
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

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => {
          if (review.hidden && !isAdmin) return null;
          return (
            <Card key={review.id} className={review.hidden ? "opacity-50 border-dashed" : ""}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{review.user.name}</p>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => toggleHide(review.id, !review.hidden)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                      >
                        {review.hidden ? "Unhide" : "Hide"}
                      </button>
                    )}
                    {review.sentiment && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SENTIMENT_STYLES[review.sentiment] ?? "bg-muted text-muted-foreground"}`}>
                        {review.sentiment}
                      </span>
                    )}
                    <p className="text-sm">{"⭐".repeat(review.rating)}</p>
                  </div>
                </div>

                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}

                {/* Helpfulness voting */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-muted-foreground">Helpful?</span>
                  <button
                    onClick={() => vote(review.id, "helpful")}
                    disabled={!!voted[review.id]}
                    className={`flex items-center gap-1 text-xs ${voted[review.id] === "helpful" ? "text-green-600" : "text-muted-foreground hover:text-green-600"} transition-colors`}
                  >
                    <ThumbsUp className="size-3" /> {review.helpful}
                  </button>
                  <button
                    onClick={() => vote(review.id, "notHelpful")}
                    disabled={!!voted[review.id]}
                    className={`flex items-center gap-1 text-xs ${voted[review.id] === "notHelpful" ? "text-red-500" : "text-muted-foreground hover:text-red-500"} transition-colors`}
                  >
                    <ThumbsDown className="size-3" /> {review.notHelpful}
                  </button>
                </div>

                {/* Seller reply */}
                {review.reply ? (
                  <div className="mt-2 pl-3 border-l-2 border-primary/30 space-y-0.5">
                    <p className="text-xs font-medium text-primary">Seller replied</p>
                    <p className="text-sm text-muted-foreground">{review.reply.content}</p>
                  </div>
                ) : isSeller && (
                  replyingTo === review.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        placeholder="Write your reply..."
                        value={replyText[review.id] ?? ""}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                        className="w-full min-h-12 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm resize-none outline-none focus-visible:border-ring"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => submitReply(review.id)}>Post Reply</Button>
                        <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Reply to this review
                    </button>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
