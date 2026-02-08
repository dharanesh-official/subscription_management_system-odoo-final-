-- ============================================
-- QUICK DIAGNOSTIC: Check what columns actually exist
-- Run this in Supabase SQL Editor to see your current schema
-- ============================================

-- Check ALL tables and their columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('discounts', 'taxes', 'products', 'plans', 'customers', 'subscriptions', 'invoices', 'payments', 'profiles')
ORDER BY table_name, ordinal_position;
