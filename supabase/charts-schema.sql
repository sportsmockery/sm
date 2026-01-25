-- Charts System Schema for SportsMockery
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sm_charts table
CREATE TABLE IF NOT EXISTS sm_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID,  -- Optional reference to a post
  chart_type VARCHAR(50) NOT NULL CHECK (chart_type IN ('bar', 'line', 'pie', 'player-comparison', 'team-stats')),
  title VARCHAR(255) NOT NULL,
  config JSONB DEFAULT '{}',  -- Stores size, colors, source config
  data JSONB DEFAULT '[]',  -- Chart data array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sm_charts_post_id ON sm_charts(post_id);
CREATE INDEX IF NOT EXISTS idx_sm_charts_chart_type ON sm_charts(chart_type);
CREATE INDEX IF NOT EXISTS idx_sm_charts_created_at ON sm_charts(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sm_charts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_sm_charts_updated_at ON sm_charts;
CREATE TRIGGER trigger_sm_charts_updated_at
  BEFORE UPDATE ON sm_charts
  FOR EACH ROW
  EXECUTE FUNCTION update_sm_charts_updated_at();

-- Grant necessary permissions for service role
GRANT ALL ON sm_charts TO service_role;

-- Grant read permissions for anon role (for public chart display)
GRANT SELECT ON sm_charts TO anon;

-- Comment on table
COMMENT ON TABLE sm_charts IS 'D3 charts for SportsMockery articles';
COMMENT ON COLUMN sm_charts.config IS 'JSON config: {size, colors: {scheme, team}, source: {type, query}}';
COMMENT ON COLUMN sm_charts.data IS 'JSON array of data points: [{label, value, ...}]';
