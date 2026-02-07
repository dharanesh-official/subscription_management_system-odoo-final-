-- Create type for visibility
create type public.plan_visibility as enum ('public', 'private');

-- Add visibility column to plans table
alter table public.plans 
add column visibility public.plan_visibility not null default 'private';

-- Update existing plans to be public (optional, depending on preference)
-- update public.plans set visibility = 'public';
