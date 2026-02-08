-- QUICK FIX: Add code column to discounts table
-- Run this in Supabase SQL Editor if the "code" column is missing

-- Add the code column if it doesn't exist
ALTER TABLE public.discounts 
ADD COLUMN IF NOT EXISTS code text UNIQUE;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'discounts'
ORDER BY ordinal_position;
