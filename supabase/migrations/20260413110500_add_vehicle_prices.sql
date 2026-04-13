-- Migration to add price columns to vehicles table
-- Created at: 2026-04-13 11:05:00

ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS daily_price NUMERIC,
ADD COLUMN IF NOT EXISTS weekly_price NUMERIC,
ADD COLUMN IF NOT EXISTS monthly_price NUMERIC;

-- Update indexes for performance if needed (searching by price might be useful later)
CREATE INDEX IF NOT EXISTS idx_vehicles_daily_price ON public.vehicles(daily_price);
CREATE INDEX IF NOT EXISTS idx_vehicles_weekly_price ON public.vehicles(weekly_price);
CREATE INDEX IF NOT EXISTS idx_vehicles_monthly_price ON public.vehicles(monthly_price);
