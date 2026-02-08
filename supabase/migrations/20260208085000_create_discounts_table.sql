-- Create discounts table with all necessary columns
-- This migration ensures the discounts table exists with the complete schema

CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Enable RLS on discounts
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discounts
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_discounts_product_id ON public.discounts(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON public.discounts(active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON public.discounts(valid_from, valid_until);
