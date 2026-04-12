import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-4 text-sm text-muted-foreground md:flex-row md:justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Store className="size-4" />
          AI Marketplace
        </div>
        <div className="flex gap-6">
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <Link href="/auth/register" className="hover:text-foreground transition-colors">Sell</Link>
          <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
        </div>
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}
