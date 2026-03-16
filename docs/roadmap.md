# AI Marketplace — Roadmap

---

## Executive Summary

An AI-powered multi-vendor e-commerce marketplace built with Next.js, Go WebSocket server, Groq AI, and Supabase. Sellers list products, buyers purchase and negotiate prices, and a real-time chat system powered by Go handles buyer-seller communication with an AI assistant.

**Total cost: $0/month** (all free tiers)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| State | Zustand, React Hook Form, Zod |
| Backend | Next.js API Routes |
| Database | PostgreSQL via Supabase, Prisma ORM v7 |
| Auth | NextAuth.js (Credentials + Google OAuth) |
| Realtime | Go WebSocket Server (Gorilla WebSocket) |
| AI | Groq API (llama-3.3-70b-versatile, llama-4-scout vision) |
| Images | Cloudinary |
| Email | Resend |
| Payments | UPI deep links (GPay, PhonePe, Paytm, BHIM) |

---

## System Architecture

```
Browser (Next.js UI)
        │
        │ REST API
        ▼
Next.js Backend (API Routes)
        │
        ├──────────► Supabase PostgreSQL (Prisma ORM)
        │
        ├──────────► Go Chat Server :8080 (WebSocket)
        │                     │
        │                     └── Broadcast to room clients
        │
        └──────────► Groq AI API
                          ├── Chat assistant (llama-3.3-70b)
                          ├── Description generator
                          ├── Sentiment analysis
                          ├── Review summary
                          └── Visual search (llama-4-scout vision)
```

---

## Database Schema

| Model | Key Fields |
|-------|-----------|
| User | id, name, email, role (BUYER/SELLER/ADMIN), banned |
| Product | id, title, description, price, stock, images, approved, sellerId |
| Category | id, name, slug |
| Order | id, total, status, buyerId, sellerId |
| OrderItem | id, quantity, price, orderId, productId |
| Message | id, content, roomId, senderName, senderId, receiverId |
| Review | id, rating, comment, sentiment, helpful, notHelpful, hidden |
| ReviewReply | id, content, reviewId, sellerId |
| Offer | id, amount, quantity, status, counterAmount, expiresAt |
| PlatformFee | id, month, year, earnings, feeAmount, status, utr, dueDate |
| PasswordResetToken | id, email, token, expires |

---

## Phase 1 — Foundation ✅ Complete

- Next.js 16 + Tailwind CSS v4 + TypeScript
- Prisma ORM v7 + Supabase PostgreSQL
- NextAuth (Credentials + Google OAuth)
- Register / Login / Forgot Password / Reset Password
- Navbar (auth-aware) + Footer
- Role-based access (BUYER / SELLER / ADMIN)

---

## Phase 2 — Product Management ✅ Complete

- Seller dashboard with product stats
- Add / Edit / Delete products with Cloudinary image upload
- 10 seeded categories
- Product listing page with search + category filter + pagination
- Product detail page with seller info + reviews
- Admin product approval system

---

## Phase 3 — Cart & Checkout ✅ Complete

- Zustand cart (persisted to localStorage)
- Cart page — qty update, remove, clear
- Checkout with delivery form (React Hook Form + Zod)
- UPI payment — GPay, PhonePe, Paytm, BHIM deep links
- Orders API — create + list
- Order confirmation email via Resend
- Orders list + detail pages

---

## Phase 4 — Go Chat System ✅ Complete

- Go WebSocket server (port 8080, Gorilla WebSocket)
- Hub/Client pattern with room management
- Chat rooms per buyer-seller-product (`buyerId_sellerId_productId`)
- Message persistence in Supabase
- Typing indicators (2s debounce)
- Chat history on connect
- Ping/Pong keepalive (54s)
- CORS middleware

---

## Phase 5 — AI Chatbot + Seller Inbox ✅ Complete

- Groq `llama-3.3-70b-versatile` AI assistant per chat room
- AI replies with product context (title, price, description)
- AI messages broadcast via WebSocket + saved to DB
- Seller takeover / hand back to AI toggle
- Seller chat inbox (`/seller/chats`)
- Unread message badge (polls every 30s)

---

## Phase 6 — Bargaining System ✅ Complete

- Offer model (amount, quantity, status, counterAmount, expiresAt)
- Statuses: PENDING / ACCEPTED / REJECTED / COUNTERED / EXPIRED
- 24h offer expiry with auto-expire API
- MakeOfferButton — price/item + quantity fields, live savings summary
- Seller: accept / reject / counter offers
- Buyer: accept / reject counter offers
- Deal conversion → checkout at negotiated price
- 🎉 Negotiated price banner in checkout

---

## Phase 7 — AI Features ✅ Complete

- **AI Description Generator** — Groq generates product description from title + category
- **Similar Products** — TF-IDF cosine similarity, "You may also like" section
- **Review Sentiment** — Groq classifies POSITIVE / NEUTRAL / NEGATIVE on submit
- **Visual Search** — Upload image → Groq vision describes it → cosine match against products

---

## Phase 8 — Reviews System ✅ Complete

- Review form on product detail (star rating + comment)
- Groq sentiment badge per review
- AI summary card (Groq summarizes all reviews)
- Seller reply to reviews (inline form)
- Helpful / Not Helpful voting
- Admin hide/unhide reviews
- Hidden reviews shown faded to admin only

---

## Phase 9 — Admin Dashboard ✅ Complete

- Admin sidebar layout (Dashboard / Products / Users / Reviews / Fees)
- **Dashboard** — 6 stat cards: users, products, orders, revenue, reviews, overdue fees
- **Products** — approve / revoke / delete, filter by pending/approved/all
- **Users** — search, ban/unban, role change (BUYER/SELLER/ADMIN)
- **Reviews** — hide/unhide, filter by hidden, sentiment badge
- Admin link in Navbar (ADMIN only)
- Banned users blocked from login
- JWT role auto-refreshes from DB (no re-login needed after role change)

---

## Phase 9.5 — Platform Fee System ✅ Complete

- **2% monthly commission** on seller earnings
- Fee auto-calculated from last month's order totals
- Due by **5th of each month**
- Seller pays to UPI: `hritikguptak@paytm`
- Seller submits UTR/transaction ID as proof
- Auto-flagged **OVERDUE** after 5th if unpaid
- **Admin actions**: Confirm / Reject UTR / Waive
- **Seller dashboard** — earnings card, fee banner, UTR input, fee history
- **Admin fees page** — collected / pending / overdue totals, per-seller fee cards

### Fee Status Flow
```
PENDING → (seller submits UTR) → SUBMITTED → (admin confirms) → CONFIRMED
                                            → (admin rejects)  → PENDING (resubmit)
PENDING → (after 5th)          → OVERDUE
OVERDUE/PENDING → (admin waives) → WAIVED
```

---

## Phase 10 — Order Management ✅ Complete

- `sellerId` added to `Order` model — links order directly to seller
- Seller can see all incoming orders at `/seller/orders`
- Seller advances order through: `PENDING → CONFIRMED → SHIPPED → DELIVERED`
- Buyer can cancel order while still `PENDING` from `/orders/[id]`
- `PATCH /api/orders/[id]` — guarded: seller can only move forward, buyer can only cancel PENDING
- `GET /api/seller/orders` — fetches orders by `sellerId`
- Seller dashboard — "Orders" button added

### Order Status Flow
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
   ↓ (buyer cancel only)
CANCELLED
```

---

## API Routes Summary (58 total)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Products
- `GET/POST /api/products`
- `GET/PATCH/DELETE /api/products/[id]`
- `GET /api/products/[id]/similar`
- `GET /api/seller/products`
- `GET /api/categories`

### Orders
- `GET/POST /api/orders`
- `GET/PATCH /api/orders/[id]`
- `GET /api/seller/orders`

### Chat
- `GET /api/seller/chats`
- `GET /api/seller/chats/unread`
- `POST /api/chat/ai`

### Offers
- `GET/POST /api/offers`
- `PATCH /api/offers/[id]`
- `POST /api/offers/expire`

### Reviews
- `GET/POST /api/reviews`
- `GET /api/reviews/summary`
- `POST /api/reviews/[id]/reply`
- `POST /api/reviews/[id]/vote`
- `PATCH /api/reviews/[id]/hide`

### AI
- `POST /api/ai/description`
- `POST /api/search/visual`

### Seller Fees
- `GET /api/seller/fees`
- `POST /api/seller/fees/pay`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/products`
- `PATCH/DELETE /api/admin/products/[id]`
- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `GET /api/admin/reviews`
- `GET /api/admin/fees`
- `PATCH /api/admin/fees/[id]`

---

## Cost Breakdown

| Service | Usage | Cost |
|---------|-------|------|
| Vercel | Frontend hosting | $0 |
| Supabase | PostgreSQL database | $0 |
| Cloudinary | Image storage | $0 |
| Groq API | AI (LLaMA models) | $0 |
| Resend | Email delivery | $0 |
| Go server (local) | WebSocket chat | $0 |

**Total Monthly Cost: $0**

---

## Deployment Notes

- **Frontend**: Deploy to Vercel — `npm run build` must pass
- **Go Chat Server**: Deploy to Fly.io or Render (free tier)
- **Database**: Already on Supabase cloud
- **Environment variables**: Copy `.env` values to Vercel dashboard

---

**Last Updated**: Phase 10 Complete — All phases done 🎉
**Build**: ✅ Passing (58 routes, 0 TypeScript errors)
