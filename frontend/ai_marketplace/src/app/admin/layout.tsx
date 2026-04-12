"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Users, MessageSquare, ShieldCheck, IndianRupee, Image } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/fees", label: "My Income", icon: IndianRupee },
  { href: "/admin/banners", label: "Banners", icon: Image },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (session?.user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-muted/30 flex flex-col gap-1 p-4 shrink-0">
        <div className="flex items-center gap-2 mb-4 px-2">
          <ShieldCheck className="size-5 text-primary" />
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === href ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            <Icon className="size-4" />{label}
          </Link>
        ))}
      </aside>
      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
