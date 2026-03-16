"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Gift, AlertTriangle } from "lucide-react";

type Fee = {
  id: string; month: number; year: number; earnings: number; feeAmount: number;
  status: string; utr: string | null; dueDate: string; paidAt: string | null;
  seller: { id: string; name: string | null; email: string };
};

type FeeResponse = { fees: Fee[]; totalCollected: number; totalPending: number; totalOverdue: number };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  WAIVED: "bg-muted text-muted-foreground",
};

const FILTERS = ["all", "SUBMITTED", "PENDING", "OVERDUE", "CONFIRMED"] as const;

export default function AdminFeesPage() {
  const [data, setData] = useState<FeeResponse | null>(null);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/fees").then(async (r) => {
      if (r.ok) setData(await r.json());
    });
  }, []);

  async function act(feeId: string, action: "confirm" | "reject" | "waive") {
    setActing(feeId + action);
    const res = await fetch(`/api/admin/fees/${feeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData((prev) => prev ? {
        ...prev,
        fees: prev.fees.map((f) => f.id === feeId ? { ...f, status: updated.status, utr: updated.utr } : f),
      } : prev);
    }
    setActing(null);
  }

  const filtered = data?.fees.filter((f) => filter === "all" || f.status === filter) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Platform Fees</h1>
        <p className="text-sm text-muted-foreground">2% monthly commission from sellers</p>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">₹{data.totalCollected.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pending / Submitted</p>
              <p className="text-2xl font-bold text-yellow-600">₹{data.totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">₹{data.totalOverdue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>

      {/* Fees List */}
      {!data ? <p className="text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No fees found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <Card key={f.id} className={f.status === "OVERDUE" ? "border-red-300" : f.status === "SUBMITTED" ? "border-blue-300" : ""}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{f.seller.name ?? f.seller.email}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[f.status]}`}>{f.status}</span>
                      {f.status === "OVERDUE" && <AlertTriangle className="size-3 text-red-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{f.seller.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{f.feeAmount.toLocaleString()} due</p>
                    <p className="text-xs text-muted-foreground">{MONTHS[f.month - 1]} {f.year} · Earnings: ₹{f.earnings.toLocaleString()}</p>
                  </div>
                </div>

                {f.utr && (
                  <div className="bg-muted rounded-lg px-3 py-2 text-xs">
                    UTR / Ref: <span className="font-mono font-semibold">{f.utr}</span>
                    {f.paidAt && <span className="text-muted-foreground ml-2">· Submitted {new Date(f.paidAt).toLocaleDateString("en-IN")}</span>}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-muted-foreground flex-1">
                    Due: {new Date(f.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {f.status === "SUBMITTED" && (
                    <>
                      <Button size="sm" disabled={!!acting} onClick={() => act(f.id, "confirm")}>
                        <CheckCircle className="size-3 mr-1" />{acting === f.id + "confirm" ? "..." : "Confirm"}
                      </Button>
                      <Button size="sm" variant="outline" disabled={!!acting} onClick={() => act(f.id, "reject")}>
                        <XCircle className="size-3 mr-1" />{acting === f.id + "reject" ? "..." : "Reject UTR"}
                      </Button>
                    </>
                  )}
                  {(f.status === "PENDING" || f.status === "OVERDUE") && (
                    <Button size="sm" variant="outline" disabled={!!acting} onClick={() => act(f.id, "waive")}>
                      <Gift className="size-3 mr-1" />{acting === f.id + "waive" ? "..." : "Waive"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
