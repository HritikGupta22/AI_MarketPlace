# AI Marketplace — Progress Log

---

## 🔄 Current Status
- Dev server: http://localhost:3000
- Current branch: `hritik`
- GitHub: https://github.com/HritikGupta22/AI_MarketPlace
- Build: ✅ Passing (24 routes — 0 errors)

---

## ✅ Phase 1 — COMPLETED (Week 1-2)

| Task | Status |
|------|--------|
| Initialize Next.js 16 + Tailwind CSS v4 + TypeScript | ✅ Done |
| Install shadcn/ui (Button, Card, Input) | ✅ Done |
| Setup Prisma ORM v7 with pg adapter | ✅ Done |
| Define DB schema (User, Product, Order, Message, Review, Category) | ✅ Done |
| Configure Supabase — env variables filled | ✅ Done |
| Run Prisma migration (`init`) to Supabase | ✅ Done |
| Generate Prisma client | ✅ Done |
| Implement NextAuth (Credentials + Google OAuth) | ✅ Done |
| Google OAuth — allowDangerousEmailAccountLinking enabled | ✅ Done |
| Register API route (`/api/auth/register`) | ✅ Done |
| Login page with reset success + OAuth error messages | ✅ Done |
| Register page with Buyer/Seller role | ✅ Done |
| Forgot Password page + API (Resend email) | ✅ Done |
| Reset Password page + API (token validation) | ✅ Done |
| PasswordResetToken model + migration | ✅ Done |
| Sign Out → redirects to `/auth/login` | ✅ Done |
| Navbar component (auth-aware) | ✅ Done |
| Footer component | ✅ Done |
| SessionProvider in layout | ✅ Done |
| NextAuth TypeScript types | ✅ Done |
| Fixed turbopack root (stray package-lock.json removed) | ✅ Done |

---

## ✅ Phase 2 — COMPLETED (Week 3-4)

| Task | Status |
|------|--------|
| Cloudinary setup (image upload) | ✅ Done |
| Seed 10 default categories into Supabase | ✅ Done |
| Categories API (`/api/categories`) | ✅ Done |
| Product CRUD API (`/api/products`, `/api/products/[id]`) | ✅ Done |
| Seller products API (`/api/seller/products`) | ✅ Done |
| Seller dashboard (`/seller/dashboard`) | ✅ Done |
| Add product page (`/seller/products/new`) | ✅ Done |
| Edit product page (`/seller/products/[id]/edit`) | ✅ Done |
| Shared ProductForm component with Cloudinary upload | ✅ Done |
| Product listing page (`/products`) with search + filter + pagination | ✅ Done |
| Product detail page (`/products/[id]`) with reviews + seller info | ✅ Done |

---

## ✅ Phase 3 — COMPLETED (Week 5-6)

| Task | Status |
|------|--------|
| Zustand cart store (persisted to localStorage) | ✅ Done |
| React Hook Form + Zod validation | ✅ Done |
| AddToCartButton component (with added feedback) | ✅ Done |
| Navbar cart count badge | ✅ Done |
| Cart page (`/cart`) — view, qty update, remove, clear | ✅ Done |
| Checkout page (`/checkout`) — delivery form + UPI payment | ✅ Done |
| UPI payment — individual app buttons (GPay, PhonePe, Paytm, BHIM) | ✅ Done |
| Copy UPI ID fallback for manual payment | ✅ Done |
| Orders API (`/api/orders`) — create + list | ✅ Done |
| Order confirmation email via Resend | ✅ Done |
| Orders list page (`/orders`) | ✅ Done |
| Order detail page (`/orders/[id]`) with success banner | ✅ Done |
| Orders link in Navbar | ✅ Done |

---

## 📁 Key Files — Phase 3

```
src/
├── store/
│   └── cartStore.ts                        ← Zustand cart (persist to localStorage)
├── app/
│   ├── cart/page.tsx                       ← Cart page (qty, remove, clear, summary)
│   ├── checkout/page.tsx                   ← Checkout (Zod form + UPI payment)
│   ├── orders/
│   │   ├── page.tsx                        ← All orders list
│   │   └── [id]/page.tsx                   ← Order detail + success banner
│   └── api/
│       └── orders/route.ts                 ← POST create order + GET list + email
└── components/
    └── products/
        └── AddToCartButton.tsx             ← Client button with added feedback
```

---

## 💳 UPI Payment Notes

- Uses individual app deep links: GPay (`tez://`), PhonePe (`phonepe://`), Paytm (`paytmmp://`), BHIM (`upi://`)
- Works on both Android and iOS
- **UPI risk warning** is normal for personal UPI IDs — user taps "Proceed anyway"
- For production → integrate **Razorpay** (2% per txn, no risk warnings, supports cards + UPI + NetBanking)

---

## 👤 Roles Explained

| Role | How to get it | Access |
|------|--------------|--------|
| `BUYER` | Default on register | Browse + buy products |
| `SELLER` | Select on register | List + manage own products |
| `ADMIN` | Manually set in Supabase DB | Full platform control (Phase 9) |

**To make yourself Admin:**
1. Go to supabase.com → Table Editor → `User` table
2. Find your user → change `role` to `ADMIN`

**To approve a product (for now):**
1. Go to supabase.com → Table Editor → `Product` table
2. Find the product → set `approved` to `true`

---

## 🐛 Issues Fixed

| Issue | Fix |
|-------|-----|
| GitHub auth failed | Fixed with Personal Access Token ✅ |
| Prisma v7 — `url` not allowed in schema.prisma | Moved to `prisma.config.ts` ✅ |
| Migration failed on pgBouncer port 6543 | Used `DIRECT_URL` (port 5432) for migrations ✅ |
| `directUrl` not valid in Prisma v7 config | Removed, only `url` supported ✅ |
| `datasourceUrl` not valid in PrismaClient constructor | Removed, Prisma v7 reads from config ✅ |
| `PrismaClientConstructorValidationError` | Added `@prisma/adapter-pg` with `PrismaPg` ✅ |
| tailwindcss not resolving (wrong workspace root) | Deleted stray `frontend/package-lock.json` + set `turbopack.root` ✅ |
| Sign out stayed on same page | Changed `callbackUrl` to `/auth/login` ✅ |
| Google OAuth `OAuthAccountNotLinked` error | Added `allowDangerousEmailAccountLinking: true` ✅ |
| "Forgot password?" link not visible | Changed to primary color with proper styling ✅ |
| Cloudinary upload preset not found | Added `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to `.env` ✅ |
| UPI `upi://` opens only WhatsApp on iPhone | Switched to individual app deep links per platform ✅ |
| UPI risk policy warning | Normal for personal UPI IDs — user taps "Proceed anyway" ✅ |

---

## 📋 Next Steps — Phase 4 (Go Chat System)

1. [ ] Initialize Go module in `services/chat-service/`
2. [ ] WebSocket server with Gorilla WebSocket
3. [ ] Chat rooms (buyer ↔ seller per product)
4. [ ] Broadcast messages to room
5. [ ] Store messages in Supabase
6. [ ] Frontend chat UI
7. [ ] WebSocket connection from Next.js
8. [ ] Typing indicators
9. [ ] Chat history loading
10. [ ] Deploy Go server to Render/Fly.io

---

## 📋 Future Phases Overview

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Foundation + Auth | ✅ Complete |
| Phase 2 | Product Management | ✅ Complete |
| Phase 3 | Cart & Checkout | ✅ Complete |
| Phase 4 | Go Chat System | 🔜 Next |
| Phase 5 | AI Chatbot (Groq) | ⏳ Pending |
| Phase 6 | Bargaining System | ⏳ Pending |
| Phase 7 | AI Features (CLIP) | ⏳ Pending |
| Phase 8 | Reviews System | ⏳ Pending |
| Phase 9 | Admin Dashboard | ⏳ Pending |

---

## ⏱️ Time Log
- Session 1: ~45 min — Project setup, Next.js init
- Session 2: ~2 hrs — Prisma, Auth, Navbar, Footer, Migration, Build fixes
- Session 3: ~1 hr — Forgot/Reset password, Google OAuth fixes, Sign out fix
- Session 4: ~2 hrs — Phase 2: Cloudinary, Categories seed, Product CRUD, Seller dashboard, Product pages
- Session 5: ~2 hrs — Phase 3: Zustand cart, Checkout, UPI payment, Orders, Email confirmation

---

**Last Updated**: Phase 3 Complete — Build passing ✅ (24 routes)
**Next Goal**: Phase 4 — Go Chat System
