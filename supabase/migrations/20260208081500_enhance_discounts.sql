ALTER TABLE public.discounts
ADD COLUMN IF NOT EXISTS valid_from timestamp with time zone,
ADD COLUMN IF NOT EXISTS valid_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS description text;
