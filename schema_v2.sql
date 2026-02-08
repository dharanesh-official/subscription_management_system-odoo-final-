-- Comprehensive Schema Update for Subscription Manager v2

-- 1. Internal User Roles & Permissions
-- Add role to profiles (assuming profiles exists, or creating it)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    role text DEFAULT 'customer' CHECK (role IN ('admin', 'internal', 'customer')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Product Variants (Attributes)
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL, -- e.g., 'Color', 'Size'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    attribute_id uuid REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value text NOT NULL, -- e.g., 'Red', 'XL'
    price_extra numeric(10,2) DEFAULT 0
);

-- 3. Subscription Order Lines
CREATE TABLE IF NOT EXISTS public.subscription_lines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    name text, -- Product/Plan name
    quantity integer DEFAULT 1,
    unit_price numeric(10,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    amount numeric(10,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100)) STORED,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Quotation Templates
CREATE TABLE IF NOT EXISTS public.quotation_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotation_template_lines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid REFERENCES public.quotation_templates(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer DEFAULT 1
);

-- 5. Payments Management
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id uuid REFERENCES public.customers(id),
    amount numeric(10,2) NOT NULL,
    payment_method text CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'upi')),
    payment_date date DEFAULT CURRENT_DATE,
    transaction_id text,
    status text DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reconciled')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Discount Management
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

-- 7. Tax Management
CREATE TABLE IF NOT EXISTS public.taxes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    rate numeric(5,2) NOT NULL, -- e.g., 18.00 for 18%
    type text DEFAULT 'percent',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update existing tables for missing fields if not already there
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_price numeric(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric(10,2) DEFAULT 0;

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS min_quantity integer DEFAULT 1;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS auto_close boolean DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS closable boolean DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS pausable boolean DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS renewable boolean DEFAULT true;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- 8. Configuration/Settings
CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial default settings
INSERT INTO public.settings (key, value, description) VALUES 
('company_name', 'SubCheck Inc.', 'The legal name of the organization'),
('default_currency', 'inr', 'Default currency for billing'),
('auto_invoice', 'true', 'Whether to automatically generate invoices for active subscriptions'),
('send_welcome_email', 'true', 'Send email to customers upon signup')
ON CONFLICT (key) DO NOTHING;
