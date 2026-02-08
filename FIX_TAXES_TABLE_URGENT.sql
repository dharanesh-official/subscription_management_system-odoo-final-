-- ============================================
-- URGENT FIX: CREATE TAXES TABLE
-- Run this in Supabase SQL Editor NOW
-- ============================================

-- Create the taxes table
CREATE TABLE IF NOT EXISTS public.taxes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    rate numeric(5,2) NOT NULL, -- e.g., 18.00 for 18%
    type text DEFAULT 'percent',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on taxes
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read taxes" ON public.taxes;
DROP POLICY IF EXISTS "Allow admins to insert taxes" ON public.taxes;
DROP POLICY IF EXISTS "Allow admins to update taxes" ON public.taxes;
DROP POLICY IF EXISTS "Allow admins to delete taxes" ON public.taxes;

-- Create RLS policies for taxes
-- Allow authenticated users to read active taxes
CREATE POLICY "Allow authenticated users to read taxes"
    ON public.taxes
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins to insert taxes
CREATE POLICY "Allow admins to insert taxes"
    ON public.taxes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update taxes
CREATE POLICY "Allow admins to update taxes"
    ON public.taxes
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete taxes
CREATE POLICY "Allow admins to delete taxes"
    ON public.taxes
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_taxes_active ON public.taxes(active);

-- Insert some default tax rates for India
INSERT INTO public.taxes (name, rate, active) VALUES 
('GST 18%', 18.00, true),
('GST 12%', 12.00, true),
('GST 5%', 5.00, true),
('GST 0%', 0.00, true)
ON CONFLICT DO NOTHING;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'taxes'
ORDER BY ordinal_position;

-- Show existing taxes
SELECT * FROM public.taxes;
