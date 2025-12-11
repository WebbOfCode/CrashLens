-- CrashLens Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity INTEGER,
  criticality TEXT CHECK (criticality IN ('critical', 'major', 'minor', 'low')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  road_name TEXT,
  length DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_time ON incidents (start_time DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_criticality ON incidents (criticality);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents (created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_incidents_updated_at 
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create analytics view for quick summaries
CREATE OR REPLACE VIEW incident_analytics AS
SELECT 
  DATE_TRUNC('hour', start_time) as hour,
  criticality,
  COUNT(*) as incident_count,
  AVG(severity) as avg_severity
FROM incidents
WHERE start_time >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', start_time), criticality
ORDER BY hour DESC;

-- Row Level Security (RLS) policies
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON incidents
    FOR SELECT USING (true);

-- Allow authenticated insert (if you add auth)
CREATE POLICY "Enable insert for authenticated users only" ON incidents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to cleanup old incidents (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_incidents()
RETURNS void AS $$
BEGIN
    DELETE FROM incidents 
    WHERE start_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-incidents', '0 2 * * *', 'SELECT cleanup_old_incidents()');
