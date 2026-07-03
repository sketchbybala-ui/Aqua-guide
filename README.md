# Aqua Guide

E-commerce storefront for Aqua Guide water purifiers (Home Use & Commercial Use), built with React + Vite + Tailwind CSS, Supabase (Auth, Postgres, Storage, Edge Functions), and Razorpay.

## Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Supabase (Postgres + Row Level Security, Auth, Storage, Edge Functions)
- **Payments**: Razorpay Checkout + Supabase Edge Functions for order creation/verification

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase + Razorpay values
npm run dev
```

See [SETUP.md](./SETUP.md) for the full first-time setup: creating the Supabase project, running migrations, uploading product images, configuring Razorpay, and deploying.

## Project structure

- `src/pages` — route-level pages (Home, Category, Product, Cart, Checkout, Auth, Profile, Admin)
- `src/components` — layout, product, cart, and UI building blocks
- `src/context` — `AuthContext` and `CartContext`
- `src/lib` — Supabase client and Razorpay checkout helper
- `supabase/migrations` — SQL schema, RLS policies, storage setup, and seed data
- `supabase/functions` — Edge Functions for Razorpay order creation, payment verification, and webhook handling
