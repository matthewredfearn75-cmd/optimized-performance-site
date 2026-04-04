-- Run this in Supabase SQL Editor to update your inventory table
-- This adds the product_id column and updates SKUs to match your website

-- Add product_id column
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS product_id text;

-- Drop the old data and reinsert with correct values
DELETE FROM inventory;

INSERT INTO inventory (product, size, sku, product_id, price, stock, threshold) VALUES
  ('Retatrutide',           '10mg',  'OP-RET-10MG',    'ret-10mg',    114.95, 150, 50),
  ('Retatrutide',           '20mg',  'OP-RET-20MG',    'ret-20mg',    179.95, 100, 40),
  ('BPC-157',               '5mg',   'OP-BPC-5MG',     'bpc-5mg',      29.95, 100, 30),
  ('BPC-157',               '10mg',  'OP-BPC-10MG',    'bpc-10mg',     54.95,  75, 25),
  ('TB-500',                '5mg',   'OP-TB500-5MG',   'tb500-5mg',    44.95,  75, 25),
  ('TB-500',                '10mg',  'OP-TB500-10MG',  'tb500-10mg',   79.95,  50, 20),
  ('BPC+TB+GHK-CU Combo',  '70mg',  'OP-COMBO-70MG',  'combo-70mg',   79.95,  40, 15),
  ('Ipamorelin',            '5mg',   'OP-IPA-5MG',     'ipa-5mg',      29.95,  75, 25),
  ('HGH 191AA',             '10iu',  'OP-HGH-10IU',    'hgh-10iu',     49.95,  50, 20),
  ('MT-2',                  '5mg',   'OP-MT2-5MG',     'mt2-5mg',      29.95,  75, 20),
  ('NAD+',                  '500mg', 'OP-NAD-500MG',   'nad-500mg',    57.95,  50, 20);
