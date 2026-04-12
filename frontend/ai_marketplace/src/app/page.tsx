"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star, ShoppingBag, Zap, Shield, Sparkles } from "lucide-react";

type Banner = {
  id?: string;
  label: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  color: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string | null; image: string | null };
  product: { title: string };
};

const STATIC_ADS: Banner[] = [
  { label: "Electronics", title: "Latest iPhone 16 Pro — Just Launched", subtitle: "Experience the future of smartphones", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80", link: "/products", color: "from-slate-900 to-slate-700" },
  { label: "Fashion", title: "New Season Collection — Summer 2025", subtitle: "Fresh styles for every occasion", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", link: "/products", color: "from-rose-900 to-rose-700" },
  { label: "Laptops", title: "MacBook Air M3 — Now Available", subtitle: "Thin, light, and incredibly powerful", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80", link: "/products", color: "from-zinc-900 to-zinc-700" },
  { label: "Headphones", title: "Sony WH-1000XM5 — Best Noise Cancelling", subtitle: "Immerse yourself in pure sound", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80", link: "/products", color: "from-blue-900 to-blue-700" },
  { label: "Clothing", title: "Streetwear Drops — Limited Edition", subtitle: "Stand out from the crowd", imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80", link: "/products", color: "from-purple-900 to-purple-700" },
];

const TAGLINES = [
  "Buy electronics, fashion, gadgets — all in one place.",
  "Whether you need a single item or bulk stock for your shop.",
  "Negotiate prices directly with sellers.",
  "AI-powered search finds exactly what you need.",
  "Shop smart. Shop fast. Shop AI Marketplace.",
];

const FEATURES = [
  { icon: Zap, title: "AI-Powered Search", desc: "Find products by uploading an image or describing what you need" },
  { icon: ShoppingBag, title: "Smart Bargaining", desc: "Negotiate prices directly with sellers using our offer system" },
  { icon: Shield, title: "Secure Payments", desc: "Pay safely via UPI — GPay, PhonePe, Paytm, BHIM" },
  { icon: Sparkles, title: "AI Chat Assistant", desc: "Get instant answers about any product from our AI assistant" },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [ads, setAds] = useState<Banner[]>(STATIC_ADS);
  const [adIndex, setAdIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tagline, setTagline] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const taglineRef = useRef({ line: 0, char: 0, deleting: false, pause: 0 });

  useEffect(() => {
    const tick = setInterval(() => {
      const s = taglineRef.current;
      const full = TAGLINES[s.line];
      if (!s.deleting) {
        if (s.char < full.length) {
          setTagline(full.slice(0, s.char + 1));
          s.char++;
        } else if (s.pause < 33) {
          s.pause++;
        } else {
          s.deleting = true;
          s.pause = 0;
        }
      } else {
        if (s.char > 0) {
          setTagline(full.slice(0, s.char - 1));
          s.char--;
        } else {
          s.line = (s.line + 1) % TAGLINES.length;
          s.deleting = false;
        }
      }
    }, 60);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetch("/api/banners").then((r) => r.json()).then((d) => {
      if (Array.isArray(d) && d.length > 0) {
        if (d.length < 5) {
          const existing = new Set(d.map((b: Banner) => b.title));
          const fill = STATIC_ADS.filter((s) => !existing.has(s.title)).slice(0, 5 - d.length);
          setAds([...d, ...fill]);
        } else {
          setAds(d);
        }
      }
    });
    fetch("/api/reviews/featured").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setReviews(d);
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [ads.length]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    else router.push("/products");
  }

  const ad = ads[adIndex];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            AI Marketplace
          </h1>
          <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">Smart Shopping for Smart People</p>
          <p className="text-muted-foreground text-lg h-7">{tagline}<span className="animate-pulse">|</span></p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search for products..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 h-11" />
            </div>
            <Button type="submit" size="lg">Search</Button>
          </form>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/products"><Button size="lg">Browse Products</Button></Link>
            <Link href="/search"><Button size="lg" variant="outline">🔍 Visual Search</Button></Link>
          </div>
        </div>
      </section>

      {/* Rotating Ad Banner */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 cursor-pointer" onClick={() => router.push(ad.link)}>
          <img src={ad.imageUrl} alt={ad.title} className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
          <div className={`absolute inset-0 bg-gradient-to-r ${ad.color} opacity-70`} />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{ad.label}</span>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">{ad.title}</h2>
            <p className="text-sm md:text-base opacity-80">{ad.subtitle}</p>
            <Button className="w-fit mt-2 bg-white text-black hover:bg-white/90" onClick={(e) => { e.stopPropagation(); router.push(ad.link); }}>Shop Now</Button>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ads.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setAdIndex(i); }} className={`size-2 rounded-full transition-all ${i === adIndex ? "bg-white w-4" : "bg-white/50"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Why AI Marketplace?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-5 space-y-2 text-center">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <f.icon className="size-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <section className="px-4 py-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">What Our Customers Say</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">Real reviews from real buyers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    {r.user.image ? (
                      <img src={r.user.image} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {r.user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{r.user.name ?? "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{r.product.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground line-clamp-3">"{r.comment}"</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Owner Section */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-72 shrink-0">
                <img src="/assests/images/hritik.jpeg" alt="Hritik Gupta" className="w-full h-64 md:h-full object-cover" />
              </div>
              <div className="p-8 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">Meet the Founder</span>
                <h2 className="text-2xl font-bold">Hritik Gupta</h2>
                <p className="text-muted-foreground leading-relaxed">
                  AI Marketplace was built with a vision to make online shopping smarter, fairer, and more personal.
                  By combining the power of AI with a multi-vendor platform, buyers can negotiate prices, search visually,
                  and get instant AI-powered assistance — all in one place.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From real-time chat to AI-generated product descriptions and sentiment-aware reviews,
                  every feature is designed to give both buyers and sellers the best experience possible.
                </p>
                <div className="flex gap-3 pt-2">
                  <Link href="/products"><Button>Start Shopping</Button></Link>
                  <Link href="/auth/register"><Button variant="outline">Join as Seller</Button></Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer CTA */}
      <section className="bg-primary/5 border-t px-4 py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to shop smarter?</h2>
        <p className="text-muted-foreground">Join thousands of buyers and sellers on AI Marketplace</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/register"><Button size="lg">Create Account</Button></Link>
          <Link href="/products"><Button size="lg" variant="outline">Browse Products</Button></Link>
        </div>
      </section>

    </div>
  );
}
