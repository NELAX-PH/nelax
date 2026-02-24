# Nelax Systems: Micro-Retail SaaS Project Strategy

## 1. Vision & Business Model

- **Vision:** To become the **most trusted and affordable digital system provider** for micro-retail businesses in the Philippines (sari-sari stores, mini groceries, small local shops).
- **Mission:** Simplify store management with a **fast, reliable, mobile-friendly web app** for sales tracking, inventory management, and real-time profit monitoring.
- **Product Positioning:** “Simple, Affordable, and Built for Small Shops.”
- **Target Price:** **Free (Lite)** and **₱149/month (Pro)**.
- **Model:** **SaaS web app** (phone/tablet/laptop) to eliminate installation friction; **subscription-based** recurring revenue.
- **MVP Features:** Authentication, **Dashboard overview**, **Product management**, **Sales recording**, **Automatic inventory deduction**, and **Daily/Monthly reports**.
- **Brand Personality:** Trustworthy, simple, modern, and **local-friendly** (not intimidating).

## 2. Design & Branding

- **UX Priority:** Usability and clarity; **Mobile-first** (no clutter, no small text, no complex charts early).
- **Layout:** Clean dashboard with left sidebar (Dashboard, Sales, Products, Reports, Settings).
- **Main View:** Cards for **Today’s sales**, Total products, **Low stock alerts**, and Recent transactions.
- **Color Palette:**
  - **Primary:** Blue (`#2563EB`) - Trust and reliability.
  - **Secondary:** Green (`#16A34A`) - Growth and profit.
  - **Background:** Light Gray (`#F9FAFB`) - Readability.
  - **Text:** Dark Gray (`#111827`) - Strong contrast.
  - **Alerts:** Red (`#DC2626`) - Low stock warnings.
- **Typography:** **Inter** font (clean and modern).
- **UI Elements:** **Rounded buttons (8px radius)**, large enough for mobile tapping.
- **Landing Page Sections:** Hero (Demo button), Features, How It Works (3 steps), Pricing (Single plan), Contact.

## 3. Technical Stack & Architecture

- **Framework:** **Next.js 14 (App Router)** for unified frontend and backend.
- **Styling:** **Tailwind CSS**.
- **Backend/Database:** **Supabase** (PostgreSQL, Auth, Backend services).
- **Deployment:** **Vercel**.
- **Required Packages:**
  - `next`, `react`, `react-dom`
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `@supabase/supabase-js`
  - `lucide-react` (icons)
  - `react-hook-form` (forms)
  - `zod` (validation)
  - `date-fns` (date handling)
- **Project Structure:**
  - `/src/app`: Pages and routing.
  - `/src/components`: Reusable UI components.
  - `/src/lib`: Database and utilities.
  - `/src/types`: TypeScript definitions.
- **Database Schema (Initial):** `users`, `products`, `sales`, `sale_items`.

## 4. Implementation Progress

### Completed Pages

- **Landing page** (`/`) with Hero, Features, How It Works, Pricing, Footer
- **Auth pages:** `/login`, `/get-started`, `/forgot-password`, `/start-trial`
- **Info pages:** `/features`, `/pricing`, `/how-it-works`, `/privacy`, `/terms`
- **Dashboard** (`/dashboard`) - Overview with **live** stats from Supabase:
  - Today's Sales (sum from `sales` table, today)
  - Active Products (count from `products` table)
  - Monthly Profit (sum from `sales` table, current month)
  - Low Stock count (products where `stock <= low_stock_threshold`)
  - Recent Sales list (last 5 from `sales` + `sale_items`)
- **Inventory** (`/dashboard/inventory`) - Full product management with Supabase CRUD:
  - Product list table (desktop) / card list (mobile) with search and category filter
  - Add/Edit/Delete product functionality via Supabase `products` table
  - Stats cards: Total Products, Inventory Value, Low Stock Alerts
  - Categories: Beverages, Snacks, Canned Goods, Condiments, Personal Care, Household, Rice & Grains, Frozen, Others
  - Profit-per-unit calculator in add/edit form
  - Low stock threshold alerts (default: 5 units)
- **Sales Report** (`/dashboard/sales`) - **Live** data from Supabase:
  - Time range filtering: Today, Weekly, Monthly, Yearly (uses `date-fns` for range calculations)
  - Metrics: Gross Sales, Net Profit, Transactions count, Avg Sale (all computed from `sales` table)
  - Top Products: aggregated from `sale_items` by revenue
  - Recent Transactions: last 5 sales with item details
  - CSV Export: exports filtered sales to downloadable CSV file
- **Settings** (`/dashboard/settings`) - Connected via `supabase.auth.updateUser()`:
  - Shop name, address (saved to `user_metadata`)
  - Default low stock threshold
  - Notification toggles (low stock alerts, daily sales summary)
  - Subscription/plan display
  - Danger zone: account deletion prompt
- **Profile** (`/dashboard/profile`) - Connected via Supabase Auth + Storage:
  - Avatar upload via **Supabase Storage** (`avatars` bucket, path: `{user_id}/avatar.{ext}`)
  - Full name, phone saved to `user_metadata`
  - Email display (read-only)
  - Password change via `supabase.auth.updateUser({ password })`
  - Member since date
- **Upgrade Page** (`/dashboard/upgrade`) - Plan upgrade interface:
  - Pro vs Lite plan comparison cards
  - Feature comparison table
  - Upgrade functionality via `supabase.auth.updateUser({ data: { plan: 'Pro' } })`
  - FAQ section
  - Redirects logged-in users with Pro plan back to dashboard

## 5. Recent Updates (Latest Session)

### Authentication Redirects

- **Added auth check to `/get-started`** - Now redirects logged-in users to `/dashboard` (previously they could access registration while logged in)
- Login page already had this check

### Avatar Upload Improvements

- **Enhanced error handling** in `/dashboard/profile/page.tsx`:
  - Specific error messages for "Storage bucket not configured"
  - Specific error messages for "Permission denied" RLSPolicy errors
  - Console logging for debugging
  - Added SQL policies for `avatars` bucket

### Profile Image in Dashboard Header

- **Added profile avatar to all dashboard pages** via `DashboardLayout.tsx`:
  - Displays user's uploaded avatar if `avatar_url` exists in `user_metadata`
  - Falls back to initials (2 letters) if no avatar
  - Shows user's first name initials with blue background
  - Clickable button navigates to `/dashboard/profile`
  - Responsive sizing (36px mobile, 40px desktop)
  - Smooth hover effects with subtle ring
  - Accessibility: `aria-label="Go to profile"`
  - Replaced previous User icon button

### Supabase Storage Setup

- **Added storage bucket policies documentation** for `avatars` bucket:
  - Public read access for avatar images
  - Authenticated users can upload avatars
  - Users can only update/delete their own avatar files
  - Policies filter by `user_id` in file path

### Supabase Backend Integration Summary

- **Auth:** All pages use `supabase.auth.getUser()` for session check, redirect to `/login` if unauthenticated
- **Database tables used:**
  - `products`: `id`, `user_id`, `name`, `category`, `price`, `cost`, `stock`, `low_stock_threshold`, `created_at`
  - `sales`: `id`, `user_id`, `total`, `profit`, `created_at`
  - `sale_items`: `id`, `sale_id`, `product_id`, `product_name`, `quantity`, `price`, `cost`, `created_at`
- **Storage:** `avatars` bucket for profile pictures
- **User metadata fields:** `full_name`, `phone`, `shop_name`, `shop_address`, `plan`, `avatar_url`, `low_stock_threshold`, `notify_low_stock`, `notify_sales`
- **Types:** Shared types in `/src/types/database.ts` (`Product`, `Sale`, `SaleItem`, `SaleWithItems`)

### Sidebar Navigation

- All dashboard pages share the same sidebar (desktop) + bottom nav (mobile) with 4 items: Overview, Inventory, Sales, Settings
- Profile page accessible via user avatar icon in headers
- **Shared Sidebar/Layout Component**: `DashboardLayout.tsx` in `/src/components/dashboard/` - all dashboard pages now use this shared component

### Next.js Config

- `next.config.mjs` configured with `images.remotePatterns` for `**.supabase.co` (avatar images)

### Supabase Setup Required

- Create `products`, `sales`, `sale_items` tables with RLS policies (filter by `user_id`)
- Create `avatars` storage bucket (public access for reading)
- **Storage bucket policies** (run these in Supabase SQL Editor):

  ```sql
  CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

  CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

  CREATE POLICY "Allow users to update own avatar files" ON storage.objects
  FOR UPDATE
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
  ```

- Enable Row Level Security on all tables

### Still TODO

- Sales recording page (point-of-sale interface to create new sales + auto-deduct inventory)
