# QuickBite

A modern, full-stack food ordering web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Lovable Cloud** (powered by Supabase). Browse a curated menu, add items to your cart, and place orders for delivery — all with real-time data, smooth animations, and a fully responsive design.

---

## ✨ Features

- **Browse Menu** — Explore dishes across categories: Burgers, Pizza, Pasta, Drinks, and Desserts.
- **Item Detail Modal** — Tap any dish to view details, adjust quantity, and add to cart.
- **Shopping Cart** — Slide-out cart drawer with quantity controls and live subtotal.
- **Secure Checkout** — Delivery details form with Cash on Delivery payment, order summary sidebar.
- **Order History** — Track all your past orders with status badges (Pending → Preparing → Out for Delivery → Delivered).
- **User Authentication** — Email/password sign-up and sign-in, plus Google OAuth login.
- **Auto Profile** — Profile created automatically on sign-up; delivery details pre-filled at checkout.
- **Responsive Design** — Fully mobile-first, card-based layout that works beautifully on all devices.
- **Smooth Animations** — Framer Motion powered page transitions, modals, and cart interactions.
- **Toast Notifications** — Real-time feedback for cart actions and order placement via Sonner.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR/SSG) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 with custom design tokens |
| **UI Components** | shadcn/ui (Radix UI primitives + custom variants) |
| **Animations** | Framer Motion |
| **State Management** | Zustand (cart store) |
| **Backend / Database** | Lovable Cloud (PostgreSQL + Auth + Row Level Security) |
| **Icons** | Lucide React |
| **Build Tool** | Vite 7 |
| **Runtime** | Cloudflare Workers (edge) |

---

## 🎨 Design System

QuickBite uses a warm, appetizing color palette defined in `src/styles.css`:

| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `#E8470A` (Deep Orange) | Buttons, accents, links, CTAs |
| **Background** | `#FFF8F0` (Cream White) | Page background |
| **Foreground** | `#1A1A1A` (Charcoal) | Body text, headings |
| **Card** | `#FFFFFF` | Cards, modals, drawer |
| **Muted** | `#F5F0EB` | Secondary backgrounds |
| **Accent** | `#FFE8D6` | Highlights, tags, badges |
| **Border** | `#E8E0D8` | Dividers, input borders |

- **Font**: Poppins (display/headings) + Inter (body)
- **Border Radius**: 0.75rem base, rounded cards and buttons
- **Shadows**: Warm orange-tinted shadows for depth
- **Gradients**: `linear-gradient(135deg, #E8470A, #F28A4D)` for primary buttons

---

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FoodCard.tsx     # Menu item card with add-to-cart
│   │   ├── CartDrawer.tsx   # Slide-out shopping cart
│   │   ├── Navbar.tsx       # Top navigation with auth state
│   │   ├── Footer.tsx       # Site footer
│   │   └── ui/              # shadcn/ui primitives (button, dialog, sheet, etc.)
│   ├── hooks/
│   │   └── use-auth.ts      # Auth session hook (Supabase)
│   ├── integrations/
│   │   ├── lovable/         # Lovable Cloud Auth (OAuth broker)
│   │   └── supabase/        # Supabase clients (browser, server, middleware)
│   ├── routes/              # TanStack file-based routes
│   │   ├── __root.tsx       # Root layout (Navbar + Footer + Outlet)
│   │   ├── index.tsx        # Homepage (hero + popular items)
│   │   ├── menu.tsx         # Full menu with category filters
│   │   ├── checkout.tsx     # Checkout page (delivery + payment)
│   │   ├── orders.tsx       # Order history for logged-in users
│   │   ├── order-confirmation.tsx  # Post-order success page
│   │   ├── login.tsx        # Sign-in (email + Google OAuth)
│   │   ├── signup.tsx       # Sign-up (email)
│   │   └── about.tsx        # About / contact page
│   ├── server.ts            # Server entry point
│   ├── start.ts             # Start instance configuration
│   ├── router.tsx           # Router setup
│   ├── store/
│   │   └── cart.ts          # Zustand cart store (items, qty, open/close)
│   └── styles.css           # Global styles + Tailwind theme tokens
├── supabase/
│   ├── config.toml          # Supabase CLI config
│   └── migrations/          # Database migrations (tables, RLS, seed data)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── wrangler.jsonc           # Cloudflare Workers config
```

---

## 🗄 Database Schema

The app uses a PostgreSQL database with the following tables:

### `profiles`
Stores extended user info linked to Supabase Auth.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | FK → `auth.users`, primary key |
| `full_name` | TEXT | User's display name |
| `email` | TEXT | Email address |
| `phone` | TEXT | Contact number |
| `address` | TEXT | Default delivery address |
| `created_at` | TIMESTAMPTZ | Auto-generated |

### `menu_items`
The food menu catalog.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Auto-generated |
| `name` | TEXT | Item name |
| `description` | TEXT | Item description |
| `price` | NUMERIC | Price in USD |
| `category` | TEXT | Burgers, Pizza, Pasta, Drinks, Desserts |
| `image_url` | TEXT | Unsplash image URL |
| `rating` | NUMERIC | Default 4.5 |
| `is_available` | BOOLEAN | Default true |
| `created_at` | TIMESTAMPTZ | Auto-generated |

### `orders`
Customer orders.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Auto-generated |
| `user_id` | UUID | FK → `auth.users` |
| `status` | TEXT | Pending / Preparing / Out for Delivery / Delivered |
| `total_amount` | NUMERIC | Order total including delivery |
| `delivery_address` | TEXT | Delivery location |
| `phone` | TEXT | Contact number |
| `full_name` | TEXT | Recipient name |
| `created_at` | TIMESTAMPTZ | Auto-generated |

### `order_items`
Line items for each order.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Auto-generated |
| `order_id` | UUID | FK → `orders` |
| `menu_item_id` | UUID | FK → `menu_items` |
| `quantity` | INTEGER | Item count |
| `unit_price` | NUMERIC | Price at time of order |
| `name` | TEXT | Item name (snapshot) |

### Row Level Security (RLS)
- **Menu items**: Public read for all visitors.
- **Profiles**: Users can only read/insert/update their own profile.
- **Orders**: Users can only read/insert their own orders.
- **Order items**: Users can only access items belonging to their own orders.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/))
- A Lovable Cloud backend (Supabase project) — already configured via `.env`

### Install Dependencies

```bash
bun install
# or
npm install
```

### Run Development Server

```bash
bun dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
bun run build
# or
npm run build
```

### Preview Production Build

```bash
bun run preview
# or
npm run preview
```

---

## 🔐 Authentication

QuickBite supports two authentication methods:

1. **Email + Password** — Standard Supabase Auth with email confirmation.
2. **Google OAuth** — Managed via Lovable's OAuth broker (`@lovable.dev/cloud-auth-js`). Users are redirected to Google's consent screen, and tokens are securely injected into Supabase Auth upon return.

The `useAuth()` hook (`src/hooks/use-auth.ts`) provides reactive session state across the app.

---

## 🛒 Cart System

The cart is managed via a Zustand store (`src/store/cart.ts`) with the following features:

- **Add items** — Click "Add to Cart" on any food card or from the item modal.
- **Quantity control** — Increment/decrement in the cart drawer or item modal.
- **Remove items** — One-tap removal from the cart drawer.
- **Live totals** — Subtotal and item count update instantly.
- **Persistent during session** — Cart state persists across page navigation within the session.
- **Slide-out drawer** — Animated cart drawer accessible from the navbar.

Delivery fee is fixed at **$2.99**.

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start Vite dev server with HMR |
| `build` | Build for production (SSR + client) |
| `build:dev` | Build in development mode |
| `preview` | Preview production build locally |
| `lint` | Run ESLint across the project |
| `format` | Format code with Prettier |

---

## 📦 Key Dependencies

- **React 19** + **React DOM**
- **TanStack Start** — Full-stack React framework
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Server state management
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Declarative animations
- **Zustand** — Lightweight state management
- **Supabase JS Client** — Database & auth SDK
- **Zod** — Schema validation
- **Sonner** — Toast notifications
- **Lucide React** — Icon library
- **shadcn/ui** primitives — Radix UI + Tailwind components

---

## 🌐 Deployment

This project is built for **Cloudflare Workers** edge runtime. It is optimized to run on the edge with minimal cold starts.

Deploy via your preferred platform that supports Vite + Cloudflare Workers (e.g., Lovable Cloud publishing).

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

Built with ❤️ using [Lovable](https://lovable.dev).
