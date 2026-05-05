-- =========================================
-- Migration v12: Shipping cost on orders
-- Paste into Supabase → SQL Editor → New query → Run
-- Idempotent — safe to re-run.
-- =========================================
--
-- Adds a `shipping` column to orders so we can record the shipping charge
-- separately from subtotal/discount/total. Pricing is computed server-side
-- in /api/orders/create — flat $15 standard, free over $200 (post-discount
-- subtotal). The column is the source of truth for accounting + CSV export.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping numeric(10,2) DEFAULT 0;

COMMENT ON COLUMN orders.shipping IS
  'Shipping charge in USD. Calculated server-side at order creation: flat $15 standard, free when post-discount subtotal >= $200. Stored separately from total for accounting + CSV export. Crypto fee surcharge (4%) applies to subtotal-discount+shipping combined.';

NOTIFY pgrst, 'reload schema';
