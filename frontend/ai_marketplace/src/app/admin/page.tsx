"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, ShoppingBag, Star, TrendingUp, Clock } from "lucide-react";

type Stats = {
  totalUsers: number; totalSellers: number; totalProducts: number; pendingProducts: number;
  totalOrders: number; totalRevenue: number; totalReviews: number; hiddenReviews: number;
  overdueFeesCount: number; overdueFeesAmount: number;
};

const STAT_CARDS = (s: Stats) => [
  { label: "Total Users", value: s.totalUsers, sub: `${s.totalSellers} sellers`, icon: Users, color: "text-blue-600" },
  { label: "Total Products", value: s.totalProducts, sub: `${s.pendingProducts} pending`, icon: Package, color: "text-purple-600" },
  { label: "Total Orders", value: s.totalOrders, sub: "all time", icon: ShoppingBag, color: "text-green-600" },
  { label: "Total Revenue", value: `₹${s.totalRevenue.toLocaleString()}`, sub: "platform wide", icon: TrendingUp, color: "text-yellow-600" },
  { label: "Reviews", value: s.totalReviews, sub: `${s.hiddenReviews} hidden`, icon: Star, color: "text-orange-600" },
  { label: "Overdue Fees", value: s.overdueFeesCount, sub: `₹${s.overdueFeesAmount.toLocaleString()} unpaid`, icon: Clock, color: s.overdueFeesCount > 0 ? "text-red-600" : "text-muted-foreground" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64">Loading stats...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STAT_CARDS(stats).map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}><Icon className="size-5" /></div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
