-- Simple update for existing salons table
-- This script only adds the missing columns to your existing salons table

-- Add admin_id column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add is_active column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add created_at column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have is_active = true
UPDATE salons SET is_active = true WHERE is_active IS NULL;

-- Update existing records to have created_at if null
UPDATE salons SET created_at = NOW() WHERE created_at IS NULL;

-- Update existing records to have updated_at if null
UPDATE salons SET updated_at = NOW() WHERE updated_at IS NULL;

-- Enable RLS on salons table
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Create basic policies for salons
CREATE POLICY "Anyone can view active salons" ON salons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage their salon" ON salons FOR ALL USING (auth.uid() = admin_id);

COMMIT;
