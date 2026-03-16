"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldOff, UserX, UserCheck } from "lucide-react";

type User = {
  id: string; name: string | null; email: string; role: string; banned: boolean; createdAt: string;
  _count: { products: number; orders: number; reviews: number };
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  SELLER: "bg-blue-100 text-blue-700",
  BUYER: "bg-muted text-muted-foreground",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => { setUsers(d); setLoading(false); });
  }, []);

  async function toggleBan(id: string, banned: boolean) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned }),
    });
    if (res.ok) setUsers((prev) => prev.map((u) => u.id === id ? { ...u, banned } : u));
  }

  async function changeRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage user roles and access</p>
      </div>

      <input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
      />

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                  {u.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{u.name ?? "No name"}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                    {u.banned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">BANNED</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email} · {u._count.products} products · {u._count.orders} orders · {u._count.reviews} reviews</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="text-xs rounded border border-input bg-transparent px-2 py-1 outline-none"
                  >
                    <option value="BUYER">BUYER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <Button size="sm" variant="outline" onClick={() => toggleBan(u.id, !u.banned)}>
                    {u.banned ? <><UserCheck className="size-3 mr-1" />Unban</> : <><UserX className="size-3 mr-1" />Ban</>}
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
