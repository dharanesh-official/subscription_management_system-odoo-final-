-- Add missing min_amount column required by the app
ALTER TABLE public.discounts
ADD COLUMN IF NOT EXISTS min_amount numeric(10,2) DEFAULT 0;
