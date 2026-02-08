-- ============================================
-- EMERGENCY FIX - Run this in Supabase SQL Editor NOW
-- ============================================

-- Option 1: Add the code column (if it doesn't exist)
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS code text;

-- Option 2: If code column exists but has NOT NULL constraint, remove it
ALTER TABLE public.discounts ALTER COLUMN code DROP NOT NULL;

-- Option 3: If you want to make code optional with a default value
ALTER TABLE public.discounts ALTER COLUMN code SET DEFAULT NULL;

-- Verify the fix
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'discounts'
AND column_name = 'code';
