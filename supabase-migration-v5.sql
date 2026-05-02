-- =========================================
-- Migration v5: Affiliate network (parent/mentee) + payouts
-- Paste into Supabase → SQL Editor → New query → Run
-- Idempotent — safe to re-run.
-- =========================================
--
-- Adds the structural pieces for the multi-tier affiliate program:
-- 1. parent_affiliate_id on affiliates — tracks who recruited each downstream affiliate
-- 2. is_flat_rate flag — distinguishes primary-tier (Tris @ 37%, no ratchet)
--    from standard affiliates (tiered 10/15/20/25/30% based on prior-month volume)
-- 3. recruiter_override_pct — % override the recruiter earns on each recruit's
--    attributed volume (paid monthly via affiliate_payouts). Recruits' own
--    commission_pct is reduced by this same %, so OPP's total payout per
--    recruited-affiliate dollar matches a standard affiliate dollar.
-- 4. affiliate_payouts table — tracks recruitment overrides, royalties,
--    and one-off manual entries. Per-order commissions stay on the orders
--    table; this table is for monthly cron-driven payouts not tied to a single order.
--
-- See docs/affiliate-program-spec.md for the program rules.

-- =========================================
-- 1. AFFILIATES — add parent + flat-rate flag + recruiter override
-- =========================================
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS parent_affiliate_id uuid REFERENCES affiliates(id);
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS is_flat_rate boolean DEFAULT false NOT NULL;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS recruiter_override_pct numeric(5,2) DEFAULT 0 NOT NULL;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS login_password_hash text;

CREATE INDEX IF NOT EXISTS idx_affiliates_parent ON affiliates(parent_affiliate_id);

COMMENT ON COLUMN affiliates.parent_affiliate_id IS
  'Set when this affiliate was recruited by another affiliate. Used by the monthly cron to compute the recruiter override. Strictly 2 levels — recruits cannot have their own sub-recruits.';

COMMENT ON COLUMN affiliates.is_flat_rate IS
  'When true, the monthly tier-ratchet job skips this affiliate — their commission_pct is treated as fixed (e.g., primary-tier at 37%). Standard affiliates have is_flat_rate=false and their commission_pct is recalculated each month based on prior-month attributed volume (minus their recruiter''s override, if applicable).';

COMMENT ON COLUMN affiliates.recruiter_override_pct IS
  'When this affiliate recruits another affiliate (i.e., another affiliate has parent_affiliate_id = this.id), they earn this percentage as an override on that recruit''s attributed volume each month. The same percentage is subtracted from the recruit''s tier rate so OPP''s total payout per dollar of recruit volume equals a standard affiliate dollar. Currently 5 for Tris, 0 for everyone else.';

COMMENT ON COLUMN affiliates.login_password_hash IS
  'scrypt-derived password hash for /affiliate dashboard login. Format: scrypt$<saltHex>$<keyHex>. Set via the admin "Set/Reset Password" action — a fresh random password is generated, hashed, and the plaintext is shown to admin once for handoff to the affiliate. NULL means the affiliate has no password set yet.';

-- =========================================
-- 2. AFFILIATE PAYOUTS — bonuses, milestones, royalties
-- =========================================
-- Per-order commissions live on the orders table (orders.affiliate_commission_pct
-- and orders.affiliate_code). This table tracks payouts that are NOT tied to a
-- single order — monthly tier bonuses, mentee milestone bonuses, royalty payments.
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid NOT NULL REFERENCES affiliates(id),
  payout_type text NOT NULL,           -- 'override' | 'royalty' | 'manual'
  period text,                          -- e.g., '2026-07' for monthly payouts
  amount numeric(10,2) NOT NULL,
  trigger_affiliate_id uuid REFERENCES affiliates(id),
                                        -- For override: the recruit whose volume generated the override
  notes text,
  paid_at timestamptz,                  -- When actually disbursed (null = pending)
  created_at timestamptz DEFAULT now(),
  UNIQUE (affiliate_id, payout_type, period, trigger_affiliate_id)
                                        -- Replay protection: don't pay the same override or royalty twice for the same period
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_period ON affiliate_payouts(period);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_pending ON affiliate_payouts(paid_at) WHERE paid_at IS NULL;

COMMENT ON TABLE affiliate_payouts IS
  'Recruitment overrides, royalties, and one-off manual entries paid to affiliates outside the per-order commission flow. Created by the monthly cron job (/api/cron/affiliate-monthly).';

COMMENT ON COLUMN affiliate_payouts.payout_type IS
  'override = recruiter.recruiter_override_pct% of a recruit''s prior-month attributed volume. royalty = 5% of total OPP gross revenue (paid to primary-tier affiliate). manual = one-off override entered by admin.';

COMMENT ON COLUMN affiliate_payouts.trigger_affiliate_id IS
  'For override, the recruit whose monthly volume generated the override payout. NULL for royalty and manual.';

-- =========================================
-- 3. RLS — only service role
-- =========================================
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
-- (No public policies; service role bypasses RLS, so server-side code reads/writes.)

-- =========================================
-- DONE
-- =========================================
NOTIFY pgrst, 'reload schema';
