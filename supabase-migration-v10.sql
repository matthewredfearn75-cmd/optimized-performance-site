-- =========================================
-- Migration v10: Fraud signals + velocity-check storage
-- Paste into Supabase → SQL Editor → New query → Run
-- Idempotent — safe to re-run.
-- =========================================
--
-- Captures request metadata (IP, user-agent) at order creation so the velocity
-- engine in src/lib/fraud-checks.js can detect address-aggregation fraud, IP
-- velocity rings, and low-trust email patterns.
--
-- Triggered after a 5/2/2026 incident: two pending orders to 14016 Bora Bora
-- Way (Marina del Rey) under different gmail identities for the same SKU on
-- the same day — classic card-testing / package-mule signature. Pre-launch
-- fraud volume is small but the chargeback ratio math is asymmetric: at $100K
-- monthly volume Visa's VDMP threshold (0.9%) is ~9 disputes; MATCH listing
-- starts at 1.5%. Refund-and-cancel beats ship-and-see every time, but you
-- need the signals captured to make that call.
--
-- See /api/orders/create for where these are populated and the admin
-- Orders tab for how flagged orders surface for manual review.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_ip text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS fraud_status text NOT NULL DEFAULT 'unreviewed',
  ADD COLUMN IF NOT EXISTS fraud_reasons text[] NOT NULL DEFAULT '{}';

-- Address-velocity index: lookups normalize whitespace + case so trivial
-- variations ("123 main st" vs "123 Main St") collapse to one address.
CREATE INDEX IF NOT EXISTS idx_orders_address_velocity ON orders (
  lower(trim(shipping_address)),
  lower(trim(city)),
  lower(trim(state)),
  trim(zip),
  created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_orders_email_velocity
  ON orders (lower(customer_email), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_ip_velocity
  ON orders (customer_ip, created_at DESC)
  WHERE customer_ip IS NOT NULL;

-- Partial index — most rows are 'unreviewed', this index only covers the small
-- subset of flagged/blocked orders that the admin Orders tab filters on.
CREATE INDEX IF NOT EXISTS idx_orders_fraud_status
  ON orders (fraud_status, created_at DESC)
  WHERE fraud_status IN ('flagged', 'blocked');

COMMENT ON COLUMN orders.customer_ip IS
  'Client IP captured from x-forwarded-for at order creation. Used by the velocity engine to detect IP-aggregation fraud (multiple addresses from one source). Retain 90d minimum for chargeback dispute evidence; prune older rows to NULL on a quarterly retention cron when implemented.';

COMMENT ON COLUMN orders.user_agent IS
  'Client User-Agent header at order creation. Soft signal only — useful for chargeback evidence (proves a real browser session, not API curl) but trivially spoofable.';

COMMENT ON COLUMN orders.fraud_status IS
  'unreviewed = default for new orders; cleared = admin reviewed and OK to fulfill; flagged = velocity rule triggered, payment allowed but admin should review before shipping; blocked = hard rule triggered, no payment session created, admin must clear and re-process before fulfillment.';

COMMENT ON COLUMN orders.fraud_reasons IS
  'Array of reason codes set by src/lib/fraud-checks.js when velocity rules trigger. Common values: address_velocity_24h_other_identity, address_velocity_30d_other_identity, ip_velocity_24h_multi_address, email_pattern_low_trust, velocity_check_error.';

NOTIFY pgrst, 'reload schema';
