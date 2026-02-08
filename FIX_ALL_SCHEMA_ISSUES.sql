-- ============================================
-- COMPREHENSIVE DATABASE FIX
-- Run this in Supabase SQL Editor to fix ALL schema issues
-- ============================================

-- 1. FIX DISCOUNTS TABLE
-- Add code column and make it optional
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.discounts ALTER COLUMN code DROP NOT NULL;

-- Ensure all required columns exist
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS value numeric(10,2);
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS product_id uuid;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS min_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS max_discount numeric(10,2);
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS valid_from date;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS valid_until date;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. FIX TAXES TABLE
-- Ensure the rate column exists
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS rate numeric(5,2);
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS type text DEFAULT 'percent';
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 3. VERIFY FIXES
-- Check discounts table
SELECT 'DISCOUNTS TABLE:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'discounts'
ORDER BY ordinal_position;

-- Check taxes table
SELECT 'TAXES TABLE:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'taxes'
ORDER BY ordinal_position;

-- 4. SHOW EXISTING DATA
SELECT 'Existing Discounts:' as info;
SELECT * FROM public.discounts LIMIT 5;

SELECT 'Existing Taxes:' as info;
SELECT * FROM public.taxes LIMIT 5;
