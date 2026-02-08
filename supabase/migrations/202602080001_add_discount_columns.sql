-- Add missing discount columns used by the app
ALTER TABLE public.discounts
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS valid_from date,
ADD COLUMN IF NOT EXISTS valid_until date;
