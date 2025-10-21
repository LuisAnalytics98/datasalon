-- Add salon_requests table to the existing schema
-- This table stores salon access requests from potential salon administrators

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

-- Enable Row Level Security
ALTER TABLE salon_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Only authenticated users can view requests (for owner/admin access)
CREATE POLICY "Authenticated users can view salon requests" ON salon_requests FOR SELECT USING (auth.role() = 'authenticated');

-- Only system can create requests (from the public form)
CREATE POLICY "Anyone can create salon requests" ON salon_requests FOR INSERT WITH CHECK (true);

-- Only authenticated users can update requests (for owner/admin to approve/reject)
CREATE POLICY "Authenticated users can update salon requests" ON salon_requests FOR UPDATE USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_salon_requests_status ON salon_requests(status);
CREATE INDEX IF NOT EXISTS idx_salon_requests_created_at ON salon_requests(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_salon_requests_updated_at 
  BEFORE UPDATE ON salon_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
