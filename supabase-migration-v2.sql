-- Run this in Supabase SQL Editor
-- Adds dual-tier alert system: reorder_threshold (order early) + threshold (critical)

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_threshold integer;

-- Set reorder thresholds at roughly 2x the critical threshold
-- This gives ~1 month of runway for shipping + Jano testing
UPDATE inventory SET reorder_threshold = 100 WHERE product_id = 'ret-10mg';
UPDATE inventory SET reorder_threshold = 80  WHERE product_id = 'ret-20mg';
UPDATE inventory SET reorder_threshold = 60  WHERE product_id = 'bpc-5mg';
UPDATE inventory SET reorder_threshold = 50  WHERE product_id = 'bpc-10mg';
UPDATE inventory SET reorder_threshold = 50  WHERE product_id = 'tb500-5mg';
UPDATE inventory SET reorder_threshold = 40  WHERE product_id = 'tb500-10mg';
UPDATE inventory SET reorder_threshold = 30  WHERE product_id = 'combo-70mg';
UPDATE inventory SET reorder_threshold = 50  WHERE product_id = 'ipa-5mg';
UPDATE inventory SET reorder_threshold = 40  WHERE product_id = 'hgh-10iu';
UPDATE inventory SET reorder_threshold = 40  WHERE product_id = 'mt2-5mg';
UPDATE inventory SET reorder_threshold = 40  WHERE product_id = 'nad-500mg';
