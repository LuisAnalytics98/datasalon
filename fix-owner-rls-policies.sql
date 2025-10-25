-- Fix RLS policies for owner access
-- This script adds policies to allow the owner to access salon_requests and salons tables

-- First, let's check if salon_requests table exists and has RLS enabled
DO $$
BEGIN
    -- Enable RLS on salon_requests if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_requests') THEN
        ALTER TABLE salon_requests ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Owner can view all salon requests" ON salon_requests;
DROP POLICY IF EXISTS "Owner can manage salon requests" ON salon_requests;
DROP POLICY IF EXISTS "Owner can view all salons" ON salons;
DROP POLICY IF EXISTS "Owner can manage all salons" ON salons;

-- Create policies for salon_requests table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_requests') THEN
        -- Owner can view all salon requests
        CREATE POLICY "Owner can view all salon requests" ON salon_requests
            FOR SELECT USING (true);
        
        -- Owner can manage all salon requests
        CREATE POLICY "Owner can manage salon requests" ON salon_requests
            FOR ALL USING (true);
    END IF;
END $$;

-- Create policies for salons table
-- Owner can view all salons (including inactive ones)
CREATE POLICY "Owner can view all salons" ON salons
    FOR SELECT USING (true);

-- Owner can manage all salons
CREATE POLICY "Owner can manage all salons" ON salons
    FOR ALL USING (true);

-- Also ensure the existing policies remain for other users
-- Keep the existing policies for salon admins
DROP POLICY IF EXISTS "Admins can manage their salon" ON salons;
CREATE POLICY "Admins can manage their salon" ON salons
    FOR ALL USING (auth.uid() = admin_id);

-- Keep the existing policy for public viewing
DROP POLICY IF EXISTS "Anyone can view active salons" ON salons;
CREATE POLICY "Anyone can view active salons" ON salons
    FOR SELECT USING (is_active = true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON salon_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON salons TO authenticated;

-- If salon_requests table doesn't exist, create it
CREATE TABLE IF NOT EXISTS salon_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_name VARCHAR NOT NULL,
    salon_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on salon_requests
ALTER TABLE salon_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for salon_requests
CREATE POLICY "Owner can view all salon requests" ON salon_requests
    FOR SELECT USING (true);

CREATE POLICY "Owner can manage salon requests" ON salon_requests
    FOR ALL USING (true);

CREATE POLICY "Anyone can create salon requests" ON salon_requests
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON salon_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON salon_requests TO anon;
