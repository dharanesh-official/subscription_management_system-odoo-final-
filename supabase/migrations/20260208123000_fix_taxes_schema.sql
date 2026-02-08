-- Add rate column to taxes table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxes' AND column_name = 'rate') THEN 
        ALTER TABLE taxes ADD COLUMN rate numeric(5,2) DEFAULT 0.00; 
    END IF; 
END $$;

-- Ensure other columns exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxes' AND column_name = 'active') THEN 
        ALTER TABLE taxes ADD COLUMN active boolean DEFAULT true; 
    END IF; 
END $$;

-- Reload schema cache to fix the error
NOTIFY pgrst, 'reload schema';
