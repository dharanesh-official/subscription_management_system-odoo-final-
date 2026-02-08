-- Add discount_id to plans table
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS discount_id uuid REFERENCES public.discounts(id) ON DELETE SET NULL;
