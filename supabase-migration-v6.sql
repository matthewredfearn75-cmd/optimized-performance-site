-- =========================================
-- Migration v6: Backfill orders.affiliate_commission_pct + index
-- Paste into Supabase → SQL Editor → New query → Run
-- Idempotent — safe to re-run.
-- =========================================
--
-- Context: orders.affiliate_commission_pct was created by supabase-migration-affiliates.sql
-- and the order-create endpoint writes the snapshot at order time. But existing orders
-- created before that code was deployed (or any order where the snapshot didn't get
-- captured) may have NULL or 0 in this column. This migration backfills them with the
-- affiliate's current commission_pct as a best-effort approximation, so historical
-- commission reports in the affiliate dashboard show non-zero commission.
--
-- Imprecise — current rate may not match the rate at order time — but better than
-- treating these orders as $0 commission. Going forward, every new order writes the
-- accurate per-order snapshot at creation time.

-- =========================================
-- 1. Defensive: ensure column exists
-- =========================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS affiliate_commission_pct numeric(5,2) DEFAULT 0;

COMMENT ON COLUMN orders.affiliate_commission_pct IS
  'Snapshot of the affiliate''s commission_pct at order creation time. Used by the affiliate dashboard for accurate per-period commission reports — the live affiliate.commission_pct may have moved via tier ratchet since the order was placed. Set by /api/orders/create. NULL/0 for non-affiliate orders.';

-- =========================================
-- 2. Backfill historical orders
-- =========================================
UPDATE orders o
   SET affiliate_commission_pct = a.commission_pct
  FROM affiliates a
 WHERE o.affiliate_code = a.code
   AND (o.affiliate_commission_pct IS NULL OR o.affiliate_commission_pct = 0);

-- =========================================
-- 3. Index for fast affiliate-period aggregation
-- =========================================
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_period
  ON orders(affiliate_code, payment_status, created_at)
  WHERE affiliate_code IS NOT NULL;

-- =========================================
-- DONE
-- =========================================
NOTIFY pgrst, 'reload schema';
