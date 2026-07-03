# Aqua Guide — Setup Guide

Everything in this file is a manual step **you** need to do outside of the code — creating accounts, running SQL, and setting environment variables. Follow it top to bottom for a first-time setup.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick an organization, name it `aqua-guide`, set a strong database password (save it somewhere safe), pick a region close to your customers (e.g. Mumbai/`ap-south-1` for India).
3. Wait for the project to finish provisioning (~2 minutes).
4. Go to **Project Settings → API**. You'll need, for later steps:
   - **Project URL** (`https://<ref>.supabase.co`)
   - **anon public key**
   - **service_role key** (secret — never put this in frontend code or commit it)
   - Your **project ref** (the `<ref>` part of the URL)

## 2. Run the database migrations

In the Supabase Dashboard, go to **SQL Editor → New query**, and run each file below **in order**, one at a time (each is in `supabase/migrations/`):

1. `0001_schema.sql` — creates all tables, indexes, and triggers.
2. `0002_rls_policies.sql` — enables Row Level Security and creates all policies.
3. `0003_storage.sql` — creates the `product-images` Storage bucket and its policies.

Don't run `0004_seed_products.sql` yet — do step 3 first, since the seed data needs real image URLs.

## 3. Upload product images to Storage

1. In the Dashboard, go to **Storage → product-images** (created by the migration above).
2. Create two folders and upload the corresponding files from `src/assets/products/` in this repo:
   - `home-use/` → upload `home-collage-1.jpg` and `home-collage-2.jpg`
   - `commercial-use/` → upload all 5 `commercial-*.jpg` files
3. Click on any uploaded file → **Copy URL**. It will look like:
   `https://<your-project-ref>.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg`
4. Open `supabase/migrations/0004_seed_products.sql` in this repo and **find-and-replace** `YOUR_PROJECT_REF` with your actual project ref (from step 1.4) throughout the file.
5. Back in the SQL Editor, run the now-updated `0004_seed_products.sql`. This inserts the 2 categories and all 22 products.

> Note: the 17 Home Use products currently reuse 2 shared "collage" placeholder photos (the original source images had multiple products per photo). Swap in individual product photos any time via **Admin → Manage Products → Edit** once the app is running.

## 4. Configure frontend environment variables

In the project root, copy the example env file:

```bash
cp .env.example .env
```

Fill in `.env` with the values from step 1.4:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
VITE_RAZORPAY_KEY_ID=<from step 6 below>
```

Then install dependencies and run the app locally:

```bash
npm install
npm run dev
```

## 5. Create your admin account

1. Run the app (`npm run dev`), go to `/signup`, and create your own account.
2. Check your email and confirm it (Supabase sends a confirmation link by default).
3. Back in the Supabase Dashboard → **SQL Editor**, run:

```sql
update profiles set role = 'admin' where id = (
  select id from auth.users where email = 'your-email@example.com'
);
```

4. Log out and back in — you should now see an **Admin** link in the navbar, and can manage products at `/admin`.

## 6. Set up Razorpay

1. Sign up at [razorpay.com](https://razorpay.com) (or log in) and switch to **Test Mode** (top-left toggle) for now.
2. Go to **Settings → API Keys → Generate Test Key**. Copy the **Key ID** and **Key Secret**.
3. Put the **Key ID** into your frontend `.env` as `VITE_RAZORPAY_KEY_ID` (step 4 above).
4. The **Key Secret** must never go in frontend code — it's used only by the Edge Functions (next step).

### Install the Supabase CLI and deploy the Edge Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
```

Set the server-side secrets the Edge Functions need (Razorpay Key Secret, plus a webhook secret you'll create in the next step — for now set a placeholder and update it once you have the real one):

```bash
supabase secrets set RAZORPAY_KEY_ID=<your Razorpay test Key ID>
supabase secrets set RAZORPAY_KEY_SECRET=<your Razorpay test Key Secret>
supabase secrets set RAZORPAY_WEBHOOK_SECRET=<a-random-string-you-choose>
```

Deploy the three functions:

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
```

The `--no-verify-jwt` flag on the webhook is required — Razorpay calls that endpoint directly and can't send a Supabase user login token; it's authenticated instead via the Razorpay webhook signature.

### Register the webhook in Razorpay

1. In the Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**.
2. Webhook URL: `https://<your-project-ref>.functions.supabase.co/razorpay-webhook`
3. Secret: use the **exact same value** you set as `RAZORPAY_WEBHOOK_SECRET` above.
4. Active events: check `payment.captured` and `payment.failed`.
5. Save.

## 7. Test the full flow locally

1. `npm run dev`, browse to a product, **Add to Cart**, go to **Checkout**, fill in the address, and pay.
2. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/) (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV) — you're in Test Mode so no real money moves.
3. Confirm: you land on the Order Confirmation page showing "Payment Successful", and the order shows up under **Profile → Order History**.

## 8. Push to GitHub

This folder is a fresh git repo pointed at your existing GitHub repo. To push (confirm with your assistant before doing this — it wasn't done automatically):

```bash
git remote add origin https://github.com/sketchbybala-ui/Aqua-guide.git
git branch -M main
git push -u origin main
```

## 9. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `sketchbybala-ui/Aqua-guide` from GitHub.
2. Framework preset: **Vite** (should auto-detect). Build command `npm run build`, output directory `dist` (defaults are correct).
3. Add these Environment Variables in the Vercel project settings (same values as your local `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
4. Deploy. Once live, go back to Razorpay's webhook settings and Supabase Auth settings (**Authentication → URL Configuration → Site URL / Redirect URLs**) and add your Vercel production URL, so email confirmation links and auth redirects work in production.

## 10. Going live (when you're ready for real payments)

1. Complete Razorpay's KYC/activation for your account.
2. Switch Razorpay to **Live Mode**, generate **Live** API keys.
3. Update `VITE_RAZORPAY_KEY_ID` in Vercel and `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` via `supabase secrets set` with the live values.
4. Re-register the webhook URL under Live Mode in Razorpay with a fresh webhook secret, and update `RAZORPAY_WEBHOOK_SECRET` accordingly.
5. Consider replacing the shared Home Use "collage" placeholder photos with individual product photography for a more professional storefront (see note in step 3).
