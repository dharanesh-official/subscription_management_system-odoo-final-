-- URGENT FIX: Add missing discount columns
-- Run this in Supabase SQL Editor NOW

ALTER TABLE public.discounts
ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS valid_from timestamp with time zone,
ADD COLUMN IF NOT EXISTS valid_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS discount_id uuid REFERENCES public.discounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_discounts_product_id ON public.discounts(product_id);

-- Show all discounts to verify
SELECT * FROM public.discounts;
