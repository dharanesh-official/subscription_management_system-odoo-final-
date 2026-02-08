-- Add product_id to discounts table to support product-specific discounts
-- If product_id is NULL, the discount is global (applies to all products)
ALTER TABLE public.discounts
ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_discounts_product_id ON public.discounts(product_id);
