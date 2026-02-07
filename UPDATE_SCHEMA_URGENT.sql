-- Run this in Supabase SQL Editor to update your schema for the new requirements

-- Product Fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_price numeric(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric(10,2) DEFAULT 0;

-- Plan Fields
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS min_quantity integer DEFAULT 1;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS auto_close boolean DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS closable boolean DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS pausable boolean DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS renewable boolean DEFAULT true;

-- Subscription Fields
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_terms text; 
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS subscription_number serial; -- Auto-incrementing number (might fail if table has rows, use text if specific format needed, but serial is good for "Number")
-- Note: 'subscription_number' adding to existing table might require simple 'ADD COLUMN subscription_number serial'

-- If serial fails on existing data, use:
-- ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS subscription_number BIGINT;
-- CREATE SEQUENCE IF NOT EXISTS subscription_number_seq;
-- ALTER TABLE public.subscriptions ALTER COLUMN subscription_number SET DEFAULT nextval('subscription_number_seq');
