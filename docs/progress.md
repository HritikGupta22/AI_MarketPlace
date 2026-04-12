# AI Marketplace — Progress Log

---

## 🔄 Current Status
- Dev server: http://localhost:3000
- Current branch: `hritik`
- GitHub: https://github.com/HritikGupta22/AI_MarketPlace
- Database: ✅ Neon PostgreSQL (migrated from Supabase)
- Build: ✅ Passing (58 routes — 0 errors)

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

## ✅ Phase 4 — COMPLETED (Week 7-8)

| Task | Status |
|------|--------|
| Initialize Go module in `services/chat-service/` | ✅ Done |
| WebSocket server with Gorilla WebSocket | ✅ Done |
| Hub/Client pattern with room management | ✅ Done |
| Chat rooms (buyer ↔ seller per product) | ✅ Done |
| Broadcast messages to room | ✅ Done |
| Store messages in Supabase (`roomId` column added) | ✅ Done |
| Fixed `saveMessage` — correct `roomId` + `receiverId` parsing | ✅ Done |
| Fixed `GetHistory` — query by `roomId` instead of senderId | ✅ Done |
| Frontend `useChat` hook (WebSocket connection) | ✅ Done |
| Chat room UI (`/chat/[roomId]`) | ✅ Done |
| Typing indicators with 2s debounce | ✅ Done |
| Chat history loading on connect | ✅ Done |
| `ChatButton` on product detail page | ✅ Done |
| roomId format: `buyerId_sellerId_productId` | ✅ Done |
| CORS middleware on Go server | ✅ Done |
| Ping/Pong keepalive (54s ticker) | ✅ Done |

---

## ✅ Phase 5 — COMPLETED (Week 9)

| Task | Status |
|------|--------|
| Seller chat inbox (`/seller/chats`) | ✅ Done |
| Seller chats API (`/api/seller/chats`) | ✅ Done |
| Unread message badge on Navbar for sellers | ✅ Done |
| Unread count API (`/api/seller/chats/unread`) | ✅ Done |
| Polls every 30s, clears on inbox visit | ✅ Done |
| Integrate Groq API (`llama-3.3-70b-versatile`) | ✅ Done |
| AI auto-replies with product context (title, price, description) | ✅ Done |
| AI reply broadcast via WebSocket to all room clients | ✅ Done |
| AI messages saved to DB with sellerId + senderName = "AI Assistant" | ✅ Done |
| `senderName` column added to Message table + migrated | ✅ Done |
| `GetHistory` returns senderName, restores ai-bot senderId | ✅ Done |
| AI messages show on right side for seller with 🤖 tag | ✅ Done |
| AI messages show on left side for buyer with 🤖 tag | ✅ Done |
| AI typing indicator (blue animated dots) | ✅ Done |
| AI only triggers for buyers, not sellers | ✅ Done |
| Seller takeover from AI (disable bot per room) | ✅ Done |
| Hand back to AI (re-enable bot per room) | ✅ Done |
| Toggle button left of input — 🤖 blue = AI active, ✓ green = seller in control | ✅ Done |

---

## ✅ Phase 6 — COMPLETED (Week 10)

| Task | Status |
|------|--------|
| `Offer` model in Prisma schema (amount, quantity, status, counterAmount, expiresAt) | ✅ Done |
| `OfferStatus` enum (PENDING/ACCEPTED/REJECTED/COUNTERED/EXPIRED) | ✅ Done |
| Create offer API (`POST /api/offers`) | ✅ Done |
| List offers API (`GET /api/offers`) — buyer sees own, seller sees received | ✅ Done |
| Accept/Reject/Counter offer API (`PATCH /api/offers/[id]`) | ✅ Done |
| Buyer accept/reject counter offer (`buyer_accept` / `buyer_reject` actions) | ✅ Done |
| Auto-expire API (`POST /api/offers/expire`) — called on page load | ✅ Done |
| `MakeOfferButton` on product page — price per item + quantity fields | ✅ Done |
| Negative/zero price + qty blocked on input | ✅ Done |
| Live summary: your total / listed total / you save ₹X | ✅ Done |
| Qty capped at stock, price must be < listed price | ✅ Done |
| `/seller/offers` — pending offers with Accept/Reject/Counter | ✅ Done |
| `/buyer/offers` — track offers, see counters, Buy Now on accepted | ✅ Done |
| Deal conversion — accepted offer links to checkout with negotiated price + qty | ✅ Done |
| Checkout supports offer-based flow with 🎉 negotiated price banner | ✅ Done |
| Navbar — "Offers" for sellers, "My Offers" for buyers | ✅ Done |
| Seller dashboard — Offers button added | ✅ Done |

---

## ✅ Phase 7 — COMPLETED (Week 11)

| Task | Status |
|------|--------|
| AI description generator (`/api/ai/description`) via Groq | ✅ Done |
| "Generate with AI" button in ProductForm (uses title + category) | ✅ Done |
| Similar products API (`/api/products/[id]/similar`) — TF-IDF cosine similarity | ✅ Done |
| "You may also like" section on product detail page | ✅ Done |
| `sentiment` field added to Review model + migrated | ✅ Done |
| Reviews API (`/api/reviews`) — POST creates review + Groq sentiment classification | ✅ Done |
| Review form on product detail page (star rating + comment) | ✅ Done |
| Sentiment badge on each review (POSITIVE/NEUTRAL/NEGATIVE) | ✅ Done |
| Visual search API (`/api/search/visual`) — Groq vision + cosine similarity | ✅ Done |
| Visual search page (`/search`) — image upload + AI caption + results grid | ✅ Done |
| Visual Search link in Navbar | ✅ Done |

---

## ✅ Phase 8 — COMPLETED (Week 12)

| Task | Status |
|------|--------|
| `helpful`, `notHelpful`, `hidden` fields added to Review + migrated | ✅ Done |
| `ReviewReply` model added + migrated | ✅ Done |
| Seller reply API (`POST /api/reviews/[id]/reply`) | ✅ Done |
| Helpfulness voting API (`POST /api/reviews/[id]/vote`) | ✅ Done |
| Admin hide/unhide API (`PATCH /api/reviews/[id]/hide`) | ✅ Done |
| AI review summary API (`GET /api/reviews/summary`) via Groq | ✅ Done |
| ReviewSection — seller reply inline form | ✅ Done |
| ReviewSection — thumbs up/down voting | ✅ Done |
| ReviewSection — admin hide/unhide button | ✅ Done |
| ReviewSection — AI summary card at top | ✅ Done |
| Sellers blocked from submitting reviews on own products | ✅ Done |
| Hidden reviews visible only to admin (opacity + dashed border) | ✅ Done |

---

## ✅ Phase 9 — COMPLETED (Week 13)

| Task | Status |
|------|--------|
| `banned` field added to User model + migrated | ✅ Done |
| Admin stats API (`GET /api/admin/stats`) | ✅ Done |
| Admin products API (`GET /api/admin/products`) with filter | ✅ Done |
| Admin approve/reject/delete product (`PATCH/DELETE /api/admin/products/[id]`) | ✅ Done |
| Admin users API (`GET /api/admin/users`) | ✅ Done |
| Admin ban/unban + role change (`PATCH /api/admin/users/[id]`) | ✅ Done |
| Admin reviews API (`GET /api/admin/reviews`) | ✅ Done |
| Admin layout with sidebar navigation | ✅ Done |
| Admin dashboard (`/admin`) — 6 stat cards | ✅ Done |
| Admin products page (`/admin/products`) — approve/revoke/delete + filter | ✅ Done |
| Admin users page (`/admin/users`) — ban/unban + role change + search | ✅ Done |
| Admin reviews page (`/admin/reviews`) — hide/unhide + filter | ✅ Done |
| Admin link in Navbar (ADMIN role only) | ✅ Done |
| Banned users blocked from login | ✅ Done |
| JWT role refresh from DB on every token update | ✅ Done |

---

## ✅ Phase 9.5 — Platform Fee System — COMPLETED (Week 13)

| Task | Status |
|------|--------|
| `PlatformFee` model + `FeeStatus` enum added + migrated | ✅ Done |
| Seller fees API (`GET /api/seller/fees`) — calculates last month earnings, upserts fee, marks overdue | ✅ Done |
| Fee payment submission API (`POST /api/seller/fees/pay`) — seller submits UTR | ✅ Done |
| Admin fees list API (`GET /api/admin/fees`) — all fees with totals | ✅ Done |
| Admin fee action API (`PATCH /api/admin/fees/[id]`) — confirm / reject UTR / waive | ✅ Done |
| Seller dashboard — last month earnings card | ✅ Done |
| Seller dashboard — 2% fee due banner with UPI ID `hritikguptak@paytm` | ✅ Done |
| Seller dashboard — UTR input + Submit Payment button | ✅ Done |
| Seller dashboard — overdue warning (red banner after 5th of month) | ✅ Done |
| Seller dashboard — fee history table | ✅ Done |
| Admin fees page (`/admin/fees`) — collected / pending / overdue summary cards | ✅ Done |
| Admin fees page — confirm / reject UTR / waive actions | ✅ Done |
| Admin fees page — filter by status | ✅ Done |
| Admin dashboard — overdue fees count + amount stat card | ✅ Done |
| Admin sidebar — Platform Fees link added | ✅ Done |

---

## ✅ Phase 10 — Order Management — COMPLETED (Week 14)

| Task | Status |
|------|--------|
| `sellerId String?` added to `Order` model | ✅ Done |
| Named relations `BuyerOrders` / `SellerOrders` on `User` model | ✅ Done |
| `prisma db push` + `prisma generate` — schema synced | ✅ Done |
| `POST /api/orders` — resolves + stores `sellerId` from first item's product | ✅ Done |
| `GET /api/orders/[id]` — buyer or seller can fetch their order | ✅ Done |
| `PATCH /api/orders/[id]` — seller advances status, buyer cancels PENDING only | ✅ Done |
| `GET /api/seller/orders` — seller fetches all incoming orders by `sellerId` | ✅ Done |
| `/seller/orders` page — seller sees orders with Confirm / Ship / Deliver buttons | ✅ Done |
| `/orders/[id]` — converted to client component, Cancel button shown when PENDING | ✅ Done |
| Seller dashboard — "Orders" button added to header | ✅ Done |
| Fixed `admin/users` route — `orders` → `buyerOrders` after relation rename | ✅ Done |

### Order Status Flow
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
   ↓ (buyer can cancel only here)
CANCELLED
```

---

## ✅ Phase 11 — Database Migration + Fixes — COMPLETED (Week 14)

| Task | Status |
|------|--------|
| Migrated database from Supabase → Neon PostgreSQL | ✅ Done |
| Neon project created — AWS Asia Pacific (Singapore) | ✅ Done |
| `DATABASE_URL` + `DIRECT_URL` updated in `.env` | ✅ Done |
| `prisma db push` to Neon — all tables created | ✅ Done |
| Categories re-seeded on Neon | ✅ Done |
| `prisma.ts` — switched to `DIRECT_URL` for runtime client (avoids pgBouncer issues) | ✅ Done |
| `suppressHydrationWarning` added to Input component (browser extension false positive) | ✅ Done |

---

## 💰 Platform Fee Logic

- **Rate**: 2% of seller's total monthly earnings
- **Calculation**: Sum of all `OrderItem.price × quantity` for seller's products in that month
- **Due date**: 5th of the following month
- **Payment**: Seller pays via UPI to `hritikguptak@paytm` and submits UTR
- **Admin actions**: Confirm (verified) / Reject UTR (seller resubmits) / Waive (forgive fee)
- **Overdue**: Auto-flagged after 5th if still PENDING — admin sees warning flag

---

## 👤 Roles Explained

| Role | How to get it | Access |
|------|--------------|--------|
| `BUYER` | Default on register | Browse + buy products |
| `SELLER` | Select on register | List + manage own products |
| `ADMIN` | Manually set in Neon DB | Full platform control |

**To make yourself Admin:**
1. Go to [neon.tech](https://neon.tech) → your project → **Tables**
2. Find `User` table → find your user → change `role` to `ADMIN`
3. Sign out and sign back in

---

## 🐛 Issues Fixed

| Issue | Fix |
|-------|-----|
| GitHub auth failed | Fixed with Personal Access Token ✅ |
| Prisma v7 — `url` not allowed in schema.prisma | Moved to `prisma.config.ts` ✅ |
| Migration failed on pgBouncer port 6543 | Used `DIRECT_URL` (port 5432) for migrations ✅ |
| `PrismaClientConstructorValidationError` | Added `@prisma/adapter-pg` with `PrismaPg` ✅ |
| tailwindcss not resolving (wrong workspace root) | Deleted stray `frontend/package-lock.json` ✅ |
| Google OAuth `OAuthAccountNotLinked` error | Added `allowDangerousEmailAccountLinking: true` ✅ |
| UPI `upi://` opens only WhatsApp on iPhone | Switched to individual app deep links ✅ |
| `llama3-8b-8192` decommissioned | Switched to `llama-3.3-70b-versatile` ✅ |
| HuggingFace CLIP/BLIP no inference provider | Switched to Groq vision model ✅ |
| Admin role not reflected without re-login | JWT now refreshes role from DB on every update ✅ |
| Admin pages crashing on 401 (stale JWT) | Added `if (!r.ok) return` guards on all admin fetches ✅ |
| Prisma schema corrupted during edit | Restored `model Review {` keyword manually ✅ |
| `sellerId` migration blocked by existing rows | Made `sellerId` optional (`String?`) ✅ |
| Supabase free tier pausing after 7 days inactivity | Migrated to Neon (never pauses) ✅ |
| `P1001` Can't reach database — pgBouncer timeout | Switched runtime client to `DIRECT_URL` ✅ |
| `admin/users` crash — unknown field `orders` | Renamed to `buyerOrders` after relation rename ✅ |
| Hydration mismatch on Input — browser extension | Added `suppressHydrationWarning` to Input ✅ |

---

## ⏱️ Time Log

- Session 1: ~45 min — Project setup, Next.js init
- Session 2: ~2 hrs — Prisma, Auth, Navbar, Footer, Migration, Build fixes
- Session 3: ~1 hr — Forgot/Reset password, Google OAuth fixes, Sign out fix
- Session 4: ~2 hrs — Phase 2: Cloudinary, Categories seed, Product CRUD, Seller dashboard, Product pages
- Session 5: ~2 hrs — Phase 3: Zustand cart, Checkout, UPI payment, Orders, Email confirmation
- Session 6: ~2 hrs — Phase 4: Go WebSocket server, chat rooms, frontend hook, chat UI, bug fixes
- Session 7: ~2 hrs — Phase 5: Groq AI, seller inbox, unread badge, bot message persistence
- Session 8: ~2 hrs — Phase 6: Offer model, APIs, MakeOfferButton, seller/buyer offer pages, deal conversion
- Session 9: ~2 hrs — Phase 7: AI description generator, similar products, review sentiment, visual search
- Session 10: ~2 hrs — Phase 8: ReviewReply model, helpfulness voting, admin moderation, AI summary
- Session 11: ~3 hrs — Phase 9 + 9.5: Admin dashboard, user management, platform fee system
- Session 12: ~1 hr — Phase 10: Order management, seller order page, buyer cancel, sellerId on Order
- Session 13: ~1 hr — Phase 11: Neon migration, bug fixes, hydration warning fix

---

## ✅ Phase 12 — Landing Page + Banners — COMPLETED (Week 15)

| Task | Status |
|------|--------|
| Full landing page built (`/`) — hero, banners, features, reviews, owner section, footer CTA | ✅ Done |
| `Banner` model added to Prisma schema | ✅ Done |
| `prisma db push` + `prisma generate` — Banner table created on Neon | ✅ Done |
| `GET /api/banners` — public, returns active banners ordered by `order` | ✅ Done |
| `GET/POST /api/admin/banners` — admin CRUD | ✅ Done |
| `PATCH/DELETE /api/admin/banners/[id]` — admin update/delete | ✅ Done |
| `/admin/banners` page — add, preview, toggle active, reorder, delete | ✅ Done |
| Banners link added to admin sidebar | ✅ Done |
| Homepage fetches banners from DB, fills remaining from static if < 5 | ✅ Done |
| `GET /api/reviews/featured` — top 6 positive reviews for homepage | ✅ Done |
| Hero — "AI Marketplace" large heading + gradient animated slogan | ✅ Done |
| Typewriter effect on tagline — types, holds 1s, deletes, loops forever | ✅ Done |
| Rotating ad banner — auto-rotates every 4s with dot navigation | ✅ Done |
| Features section — 4 cards (AI Search, Bargaining, Payments, AI Chat) | ✅ Done |
| Customer reviews section — real DB reviews with user photo / letter avatar | ✅ Done |
| Owner section — Hritik photo + description + CTA buttons | ✅ Done |
| Footer CTA — Create Account + Browse Products | ✅ Done |
| Footer links (Products / Sell / Sign In) perfectly centered with absolute positioning | ✅ Done |
| `suppressHydrationWarning` added to Input component | ✅ Done |

---

## 📋 Phases Overview

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Foundation + Auth | ✅ Complete |
| Phase 2 | Product Management | ✅ Complete |
| Phase 3 | Cart & Checkout | ✅ Complete |
| Phase 4 | Go Chat System | ✅ Complete |
| Phase 5 | AI Chatbot + Seller Inbox | ✅ Complete |
| Phase 6 | Bargaining System | ✅ Complete |
| Phase 7 | AI Features | ✅ Complete |
| Phase 8 | Reviews System | ✅ Complete |
| Phase 9 | Admin Dashboard | ✅ Complete |
| Phase 9.5 | Platform Fee System | ✅ Complete |
| Phase 10 | Order Management | ✅ Complete |
| Phase 11 | DB Migration + Fixes | ✅ Complete |
| Phase 12 | Landing Page + Banners | ✅ Complete |
| Phase 13 | Deployment | 🔜 Next |

---

**Last Updated**: Phase 12 Complete — Build passing ✅ (60 routes)
**Status**: Core features complete — ready for deployment 🚀
