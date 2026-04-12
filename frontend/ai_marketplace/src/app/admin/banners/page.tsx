"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

type Banner = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  color: string;
  active: boolean;
  order: number;
};

const COLORS = [
  { label: "Slate", value: "from-slate-900 to-slate-700" },
  { label: "Rose", value: "from-rose-900 to-rose-700" },
  { label: "Zinc", value: "from-zinc-900 to-zinc-700" },
  { label: "Blue", value: "from-blue-900 to-blue-700" },
  { label: "Purple", value: "from-purple-900 to-purple-700" },
  { label: "Green", value: "from-green-900 to-green-700" },
  { label: "Orange", value: "from-orange-900 to-orange-700" },
];

const EMPTY = { label: "", title: "", subtitle: "", imageUrl: "", link: "/products", color: "from-slate-900 to-slate-700" };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/banners").then((r) => r.json()).then((d) => { setBanners(d); setLoading(false); });
  }, []);

  async function createBanner() {
    if (!form.label || !form.title || !form.imageUrl) return;
    setSaving(true);
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: banners.length }),
    });
    if (res.ok) {
      const b = await res.json();
      setBanners((prev) => [...prev, b]);
      setForm(EMPTY);
    }
    setSaving(false);
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) setBanners((prev) => prev.map((b) => b.id === id ? { ...b, active } : b));
  }

  async function deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  async function moveOrder(id: string, dir: "up" | "down") {
    const idx = banners.findIndex((b) => b.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const updated = [...banners];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    const reordered = updated.map((b, i) => ({ ...b, order: i }));
    setBanners(reordered);

    await Promise.all([
      fetch(`/api/admin/banners/${reordered[idx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: reordered[idx].order }) }),
      fetch(`/api/admin/banners/${reordered[swapIdx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: reordered[swapIdx].order }) }),
    ]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banners</h1>
        <p className="text-sm text-muted-foreground">Manage homepage rotating ad banners</p>
      </div>

      {/* Create Form */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="font-semibold text-sm">Add New Banner</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Label (e.g. Electronics)" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            <Input placeholder="Title (e.g. iPhone 16 Pro — Just Launched)" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <Input placeholder="Subtitle (e.g. Experience the future)" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
            <Input placeholder="Image URL (Unsplash or Cloudinary)" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
            <Input placeholder="Link (default: /products)" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} />
            <select
              value={form.color}
              onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
            >
              {COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {form.imageUrl && (
            <div className="relative rounded-xl overflow-hidden h-32">
              <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${form.color} opacity-60`} />
              <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                <span className="text-xs opacity-70">{form.label}</span>
                <p className="font-bold">{form.title}</p>
                <p className="text-xs opacity-70">{form.subtitle}</p>
              </div>
            </div>
          )}
          <Button onClick={createBanner} disabled={saving || !form.label || !form.title || !form.imageUrl}>
            <Plus className="size-4 mr-1" />{saving ? "Saving..." : "Add Banner"}
          </Button>
        </CardContent>
      </Card>

      {/* Banner List */}
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {banners.length === 0 && <p className="text-sm text-muted-foreground">No banners yet.</p>}
          {banners.map((b, idx) => (
            <Card key={b.id} className={!b.active ? "opacity-50" : ""}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative rounded-lg overflow-hidden w-32 h-16 shrink-0">
                  <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${b.color} opacity-60`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{b.label}</p>
                  <p className="font-medium text-sm truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>
                  <p className="text-xs text-primary">{b.link}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => moveOrder(b.id, "up")} disabled={idx === 0}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => moveOrder(b.id, "down")} disabled={idx === banners.length - 1}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(b.id, !b.active)}>
                    {b.active ? <Eye className="size-4 text-green-600" /> : <EyeOff className="size-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteBanner(b.id)}>
                    <Trash2 className="size-4 text-destructive" />
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
