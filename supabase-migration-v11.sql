-- =========================================
-- Migration v11: Digital lot system — production batches + label print audit
-- Paste into Supabase → SQL Editor → New query → Run
-- Idempotent — safe to re-run.
-- =========================================
--
-- Replaces the stamp-on-Avery-label approach with on-demand Phomemo thermal
-- labels carrying a QR code + lot text. Each customer-facing batch becomes a
-- real DB row (not just ink on a sticker), with chain-of-custody back to the
-- supplier shipment via supplier_lot_id FK to supply_lots (existing v4 table).
--
-- Workflow:
--   1. Admin → Batches → New Batch → pick SKU, vials produced, optional
--      supplier_lot_id; system auto-suggests lot_number from today's date.
--   2. Admin → Batches → Upload COA (PDF) when Vanguard report lands.
--   3. Admin → Batches → Print Labels → renders 2"×1" two-up Phomemo PNG with
--      QR (encodes /coa/{sku}/{lot}) + LOT/EXP text. Each print logged to
--      label_prints for audit + recall traceability.
--
-- The QR URL points at the existing /coa/{sku}/{batch} route pattern referenced
-- in the launch posture; the route can serve a static PDF today and graduate
-- to a route handler that queries this table later without breaking QR codes.

CREATE TABLE IF NOT EXISTS batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Customer-facing identity. (sku, lot_number) is the unique key — lot_number
  -- format is YYMMDD or YYMMDD-A (suffix only when same SKU produced twice on
  -- the same day, which is rare).
  sku text NOT NULL,
  lot_number text NOT NULL,

  -- Lifecycle dates. expiry_date defaults to lot + 24 months for lyophilized
  -- peptides; admin can override per batch.
  production_date date NOT NULL,
  expiry_date date,

  -- Chain of custody back to supplier shipment. Nullable so v11 can ship
  -- without backfill — populate going forward as part of the New Batch flow.
  -- FK constraint is added conditionally below so v11 runs even if the
  -- supply_lots table from v4 hasn't been migrated to this project yet.
  supplier_lot_id uuid,

  -- Production metrics
  vials_produced integer DEFAULT 0,

  -- COA tracking. coa_pdf_path is relative to /public (e.g.,
  -- 'coa/bpc-157/260504.pdf'); coa_uploaded_at marks when the file was filed.
  coa_pdf_path text,
  coa_uploaded_at timestamptz,

  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE (sku, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_sku_production
  ON batches (sku, production_date DESC);

CREATE INDEX IF NOT EXISTS idx_batches_supplier_lot
  ON batches (supplier_lot_id)
  WHERE supplier_lot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_batches_expiry
  ON batches (expiry_date)
  WHERE expiry_date IS NOT NULL;

COMMENT ON TABLE batches IS
  'Customer-facing production lots. Each row is a unique (sku, lot_number) batch with chain-of-custody back to supplier shipment via supplier_lot_id FK. The QR codes printed on Phomemo thermal labels encode /coa/{sku}/{lot_number} and resolve to coa_pdf_path. Used by /admin/batches and the recall/dispute evidence workflow.';

COMMENT ON COLUMN batches.lot_number IS
  'YYMMDD or YYMMDD-A. Suffix used only when the same SKU is produced more than once on the same day — rare at current volume.';

COMMENT ON COLUMN batches.supplier_lot_id IS
  'Optional FK to supply_lots — the supplier shipment this customer-facing batch was produced from. Nullable for backfill flexibility; populate going forward via the New Batch flow. Useful for proactive recall (query batches WHERE supplier_lot_id = X to find every customer batch from a tainted supplier shipment).';

CREATE TABLE IF NOT EXISTS label_prints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  qty integer NOT NULL CHECK (qty > 0),

  -- Audit context — who printed and when. printed_by stores the admin
  -- identifier (email or 'admin' for the single-password setup).
  printed_at timestamptz DEFAULT now(),
  printed_by text
);

CREATE INDEX IF NOT EXISTS idx_label_prints_batch
  ON label_prints (batch_id, printed_at DESC);

COMMENT ON TABLE label_prints IS
  'Audit log of every Phomemo label print. Useful for inventory reconciliation (do printed labels match vials produced?), chargeback evidence (proves a label was printed for that batch on that date), and recall traceability.';

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_prints ENABLE ROW LEVEL SECURITY;

-- Add the FK to supply_lots only if that table exists in this project. Some
-- Supabase environments have v4's supply_lots, others don't — this lets v11
-- run idempotently in either case. Re-run v11 after running v4 (or the
-- relevant supply_lots block) to add the FK retroactively.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'supply_lots'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'batches_supplier_lot_id_fkey' AND table_name = 'batches'
  ) THEN
    ALTER TABLE batches
      ADD CONSTRAINT batches_supplier_lot_id_fkey
      FOREIGN KEY (supplier_lot_id) REFERENCES supply_lots(id);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
