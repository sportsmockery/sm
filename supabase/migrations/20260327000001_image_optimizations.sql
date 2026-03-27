-- Image optimization tracking table
-- Stores optimized versions and blur placeholders for all site images
CREATE TABLE IF NOT EXISTS image_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL UNIQUE,
  optimized_url TEXT,
  medium_url TEXT,
  thumbnail_url TEXT,
  blur_data_url TEXT,
  original_size_bytes INTEGER,
  optimized_size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  format TEXT DEFAULT 'webp',
  optimized_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by original URL
CREATE INDEX IF NOT EXISTS idx_image_optimizations_original_url
  ON image_optimizations (original_url);

-- Add optimization columns to posts table for quick access
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS optimized_image_url TEXT;
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS image_blur_hash TEXT;
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS image_optimized_at TIMESTAMPTZ;
