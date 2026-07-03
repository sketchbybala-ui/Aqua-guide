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

Don't run `0004_seed_products.sql` or `0005_add_product_features.sql` yet — do step 3 first, since the seed data needs real image URLs.

**Verify each ran cleanly** before moving on — the SQL Editor shows a green "Success" per statement. If any migration errors partway through, fix the error and re-run that whole file before continuing; a partially-applied migration is the most common cause of "empty" pages later.

## 3. Upload product images to Storage

1. In the Dashboard, go to **Storage → product-images** (created by the migration above).
2. Create two folders and upload the corresponding files from `src/assets/products/` in this repo:
   - `home-use/` → upload `home-collage-1.jpg` and `home-collage-2.jpg`
   - `commercial-use/` → upload all 5 `commercial-*.jpg` files
3. Click on any uploaded file → **Copy URL**. It will look like:
   `https://<your-project-ref>.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg`
4. Open `supabase/migrations/0004_seed_products.sql` in this repo and **find-and-replace** `YOUR_PROJECT_REF` with your actual project ref (from step 1.4) throughout the file.
5. Back in the SQL Editor, run the now-updated `0004_seed_products.sql`. This inserts the 2 categories and all 22 products.
6. Run `0005_add_product_features.sql` — adds a bullet-point "features" list to each product (shown on the product detail page) and fills it in for all 22 seeded products.
7. Confirm it worked: run `select count(*) from products;` in the SQL Editor — it should return `22`. If it returns `0`, the seed file didn't run (see Troubleshooting at the bottom).

> Note: the 17 Home Use products currently reuse 2 shared "collage" placeholder photos (the original source images had multiple products per photo). Swap in individual product photos any time via **Admin → Manage Products → Edit** once the app is running.

## 4. Configure frontend environment variables

In the project root, copy the example env file to `.env.local` (Vite's standard name for your personal, untracked API keys — it's already in `.gitignore` and Vite loads it automatically, no code changes needed; plain `.env` also works if you prefer):

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from step 1.4 — **real values, not the placeholders**:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
VITE_RAZORPAY_KEY_ID=<from step 7 below>
```

Restart `npm run dev` any time you change this file — Vite only reads env files at startup.

Then install dependencies and run the app locally:

```bash
npm install
npm run dev
```

If `.env.local` still has placeholder/example values (or is missing), every page will look empty since the app can't reach any database — this is the other common cause of "no products found."

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

## 6. Enable Email OTP login

The app's `/login` page has a "Log in with OTP" tab (alongside regular password login) that emails a 6-digit code. Supabase's default email template sends a clickable magic-link instead of a plain code, so it needs one tweak to actually work as OTP:

1. In the Supabase Dashboard, go to **Authentication → Email Templates → Magic Link**.
2. Edit the template body so it includes the code, e.g.:
   ```
   Your Aqua Guide login code is: {{ .Token }}
   ```
   (`{{ .Token }}` is the 6-digit code; you can keep or remove `{{ .ConfirmationURL }}` alongside it.)
3. Save the template.
4. (Optional but recommended for testing) **Authentication → Providers → Email** → confirm "Enable email provider" is on and note the default rate limit (a handful of emails/hour) — fine for testing, but raise it or configure a custom SMTP provider under **Project Settings → Auth → SMTP Settings** before real customers rely on it, since Supabase's built-in email sender is rate-limited and meant for development.

That's it — no extra account or cost, unlike phone/SMS OTP (not implemented in this build; ask if you want it added later, but note it needs a separate paid SMS provider like Twilio or MSG91 configured in Supabase).

## 7. Set up Razorpay

1. Sign up at [razorpay.com](https://razorpay.com) (or log in) and switch to **Test Mode** (top-left toggle) for now.
2. Go to **Settings → API Keys → Generate Test Key**. Copy the **Key ID** and **Key Secret**.
3. Put the **Key ID** into your frontend `.env.local` as `VITE_RAZORPAY_KEY_ID` (step 4 above).
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

## 8. Test the full flow locally

1. `npm run dev`, browse to a product, **Add to Cart**, go to **Checkout**, fill in the address, and pay.
2. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/) (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV) — you're in Test Mode so no real money moves.
3. Confirm: you land on the Order Confirmation page showing "Payment Successful", and the order shows up under **Profile → Order History**.
4. Try `/login` → **Log in with OTP** with your account's email and confirm the code arrives and logs you in.

## 9. Push to GitHub

Already done for the initial build — the repo is live at `https://github.com/sketchbybala-ui/Aqua-guide`. For any future local changes:

```bash
git add -A
git commit -m "describe your change"
git push
```

## 10. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `sketchbybala-ui/Aqua-guide` from GitHub.
2. Framework preset: **Vite** (should auto-detect). Build command `npm run build`, output directory `dist` (defaults are correct).
3. Add these Environment Variables in the Vercel project settings (same values as your local `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
4. Deploy. Once live, go back to Razorpay's webhook settings and Supabase Auth settings (**Authentication → URL Configuration → Site URL / Redirect URLs**) and add your Vercel production URL, so email confirmation links, OTP emails, and auth redirects work in production.

## 11. Going live (when you're ready for real payments)

1. Complete Razorpay's KYC/activation for your account.
2. Switch Razorpay to **Live Mode**, generate **Live** API keys.
3. Update `VITE_RAZORPAY_KEY_ID` in Vercel and `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` via `supabase secrets set` with the live values.
4. Re-register the webhook URL under Live Mode in Razorpay with a fresh webhook secret, and update `RAZORPAY_WEBHOOK_SECRET` accordingly.
5. Consider replacing the shared Home Use "collage" placeholder photos with individual product photography for a more professional storefront (see note in step 3).

---

## Troubleshooting: "No products found" / empty pages

Work through these in order — each one has caused this exact symptom:

1. **Check `.env.local` has real values.** Open `.env.local` in the project root and confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are your actual project's values, not the `placeholder`/`YOUR_PROJECT_REF` example text. Restart `npm run dev` after editing `.env.local` — Vite only reads it at startup.
2. **Check the seed data actually landed.** In the Supabase SQL Editor: `select count(*) from products;`. Should be `22`. If `0`, go back to step 3 above and run `0004_seed_products.sql`.
3. **Check the browser console** (F12 → Console) for errors while on a product/category page. A `Failed to fetch` or DNS-style error means step 1 (env vars) is the issue. A `permission denied for table products` or similar means RLS/migration 0002 didn't apply — re-run `0002_rls_policies.sql`.
4. **Check you're not filtering everything out accidentally** — the Admin → Manage Products list shows every product regardless of `is_active`; the public storefront only shows `is_active = true` ones. If you've been editing products in Admin, make sure "Active (visible in store)" is checked.
