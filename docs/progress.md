# AI Marketplace — Progress Log

---

## 🔄 Current Status
- Dev server: http://localhost:3000
- Current branch: `hritik`
- GitHub: https://github.com/HritikGupta22/AI_MarketPlace
- Build: ✅ Passing (37 routes — 0 errors)

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

## 📁 Key Files — Phase 4

```
services/chat-service/
├── main.go                          ← Go HTTP server (port 8080), CORS, routes
├── handlers/
│   ├── websocket.go                 ← Hub, Client, ReadPump, WritePump, saveMessage, GetHistory
│   └── message.go                  ← ServeWS — upgrades connection, sends history
├── models/
│   └── chat.go                     ← Message + WSMessage structs
└── database/
    └── postgres.go                 ← Supabase connection via DIRECT_URL

frontend/ai_marketplace/src/
├── hooks/
│   └── useChat.ts                  ← WebSocket hook (connect, send, receive, typing)
├── app/
│   └── chat/[roomId]/page.tsx      ← Chat room UI
└── components/products/
    └── ChatButton.tsx              ← Builds roomId, navigates to chat
```

---

## 🐛 Phase 4 Issues Fixed

| Issue | Fix |
|-------|-----|
| `GetHistory` queried `senderId = roomID` | Fixed to `WHERE roomId = $1` ✅ |
| `saveMessage` passed roomId as receiverId | Fixed — parses `buyerId_sellerId_productId`, derives correct receiverId ✅ |
| `Message` table missing `roomId` column | Added `roomId String` + `@@index([roomId])` to Prisma schema + migrated ✅ |
| Hydration mismatch on Navbar cart badge | Fixed with `mounted` state — badge only renders after client mount ✅ |

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

## 📁 Key Files — Phase 5

```
frontend/ai_marketplace/src/
├── app/
│   ├── api/
│   │   ├── chat/ai/route.ts              ← Groq API route (product context + LLaMA)
│   │   └── seller/
│   │       ├── chats/route.ts            ← Seller inbox API
│   │       └── chats/unread/route.ts     ← Unread count API
│   └── seller/chats/page.tsx            ← Seller chat inbox UI
├── hooks/useChat.ts                      ← Updated: AI trigger + bot WS send
├── components/
│   ├── layout/Navbar.tsx                 ← Unread badge for sellers
│   └── products/ChatButton.tsx          ← Passes product context via URL params
```

---

## 🐛 Phase 5 Issues Fixed

| Issue | Fix |
|-------|-----|
| `llama3-8b-8192` decommissioned | Switched to `llama-3.3-70b-versatile` ✅ |
| AI reply not visible to seller | Sent via WebSocket instead of local state injection ✅ |
| Bot FK constraint on DB insert | Save bot messages with sellerId as senderId ✅ |
| AI messages not persisting in history | Added `senderName` column, restored `ai-bot` id in GetHistory ✅ |
| AI message showing on wrong side for seller | `isMe = isSeller && isBot` logic fix ✅ |

---

## ✅ Phase 6 — COMPLETED (Week 10)

| Task | Status |
|------|--------|
| `Offer` model in Prisma schema (amount, quantity, status, counterAmount, expiresAt) | ✅ Done |
| `OfferStatus` enum (PENDING/ACCEPTED/REJECTED/COUNTERED/EXPIRED) | ✅ Done |
| Create offer API (`POST /api/offers`) | ✅ Done |
| List offers API (`GET /api/offers`) — buyer sees own, seller sees received | ✅ Done |
| Accept/Reject/Counter offer API (`PATCH /api/offers/[id]`) | ✅ Done |
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

## 📁 Key Files — Phase 6

```
frontend/ai_marketplace/src/
├── app/
│   ├── api/offers/
│   │   ├── route.ts              ← POST create + GET list
│   │   ├── [id]/route.ts         ← PATCH accept/reject/counter
│   │   └── expire/route.ts       ← POST auto-expire stale offers
│   ├── seller/offers/page.tsx    ← Seller offer management
│   ├── buyer/offers/page.tsx     ← Buyer offer tracking
│   └── checkout/page.tsx         ← Updated: offer-based checkout
└── components/products/
    └── MakeOfferButton.tsx       ← Price + qty fields, live summary
```

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
| Visual search API (`/api/search/visual`) — HuggingFace CLIP zero-shot | ✅ Done |
| Visual search page (`/search`) — image upload + results grid | ✅ Done |
| Visual Search link in Navbar | ✅ Done |

---

## 📁 Key Files — Phase 7

```
frontend/ai_marketplace/src/
├── app/
│   ├── api/
│   │   ├── ai/description/route.ts          ← Groq description generator
│   │   ├── reviews/route.ts                 ← POST create review + GET list (with sentiment)
│   │   ├── products/[id]/similar/route.ts   ← TF-IDF cosine similarity
│   │   └── search/visual/route.ts           ← HuggingFace CLIP visual search
│   ├── search/page.tsx                      ← Visual search UI
│   └── products/[id]/page.tsx               ← Updated: similar products + ReviewSection
└── components/products/
    ├── ProductForm.tsx                      ← Updated: "Generate with AI" button
    └── ReviewSection.tsx                   ← Review form + sentiment badges
```

---

## 📋 Next Steps — Phase 8 (Reviews System)

1. [ ] Seller can reply to reviews
2. [ ] Review helpfulness voting
3. [ ] Review moderation (admin)
4. [ ] AI review summary (Groq — summarize all reviews for a product)

---

## 📋 Future Phases Overview

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Foundation + Auth | ✅ Complete |
| Phase 2 | Product Management | ✅ Complete |
| Phase 3 | Cart & Checkout | ✅ Complete |
| Phase 4 | Go Chat System | ✅ Complete |
| Phase 5 | AI Chatbot + Seller Inbox | ✅ Complete |
| Phase 6 | Bargaining System | ✅ Complete |
| Phase 7 | AI Features (CLIP) | ✅ Complete |
| Phase 8 | Reviews System | 🔜 Next |
| Phase 9 | Admin Dashboard | ⏳ Pending |

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

---

- Session 9: ~2 hrs — Phase 7: AI description generator, similar products, review sentiment, CLIP visual search

---

**Last Updated**: Phase 7 Complete — Build passing ✅ (37 routes)
**Next Goal**: Phase 8 — Reviews System
