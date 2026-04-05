-- Run this in Supabase SQL Editor
-- Creates the orders table for tracking purchases

CREATE TABLE IF NOT EXISTS orders (
  id              serial primary key,
  order_number    text unique not null,
  customer_name   text not null,
  customer_email  text not null,
  shipping_address text not null,
  city            text not null,
  state           text not null,
  zip             text not null,
  items           jsonb not null,
  subtotal        numeric(10,2) not null,
  total           numeric(10,2) not null,
  payment_status  text not null default 'pending',
  moonpay_tx_id   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
