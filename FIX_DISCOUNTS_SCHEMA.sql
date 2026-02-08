-- ============================================
-- FIX DISCOUNTS TABLE SCHEMA ISSUE
-- Run this in Supabase SQL Editor to fix the schema cache error
-- ============================================

-- Step 1: Create the discounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE,
    name text NOT NULL,
    type text CHECK (type IN ('percentage', 'fixed')),
    value numeric(10,2) NOT NULL,
    description text,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    active boolean DEFAULT true,
    min_amount numeric(10,2) DEFAULT 0,
    max_discount numeric(10,2),
    valid_from date,
    valid_until date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Add missing columns if they don't exist (in case table was created with partial schema)
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS code text UNIQUE;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT 'Unnamed Discount';
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('percentage', 'fixed'));
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS value numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS min_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS max_discount numeric(10,2);
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS valid_from date;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS valid_until date;
ALTER TABLE public.discounts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Step 3: Remove the default from name column if it was added
ALTER TABLE public.discounts ALTER COLUMN name DROP DEFAULT;

-- Step 4: Enable RLS on discounts
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read discounts" ON public.discounts;
DROP POLICY IF EXISTS "Allow admins to insert discounts" ON public.discounts;
DROP POLICY IF EXISTS "Allow admins to update discounts" ON public.discounts;
DROP POLICY IF EXISTS "Allow admins to delete discounts" ON public.discounts;

-- Step 6: Create RLS policies for discounts
-- Allow authenticated users to read active discounts
CREATE POLICY "Allow authenticated users to read discounts"
    ON public.discounts
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins to insert discounts
CREATE POLICY "Allow admins to insert discounts"
    ON public.discounts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update discounts
CREATE POLICY "Allow admins to update discounts"
    ON public.discounts
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete discounts
CREATE POLICY "Allow admins to delete discounts"
    ON public.discounts
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discounts_product_id ON public.discounts(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON public.discounts(active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON public.discounts(valid_from, valid_until);

-- Step 8: Add discount_id to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS discount_id uuid REFERENCES public.discounts(id) ON DELETE SET NULL;

-- Step 9: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'discounts'
ORDER BY ordinal_position;

-- Step 10: Show existing discounts (if any)
SELECT * FROM public.discounts;
