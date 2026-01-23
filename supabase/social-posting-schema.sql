-- Social Media Auto-Posting Schema Migration
-- Add social_caption and social_posted_at columns to sm_posts table

-- Add social_caption column - the text used as caption above the link card for FB and X
-- This does NOT include the article URL (URL is passed separately)
ALTER TABLE sm_posts
ADD COLUMN IF NOT EXISTS social_caption TEXT DEFAULT NULL;

-- Add social_posted_at column - timestamp when post was auto-posted to social media
-- If non-null, indicates this post has already been auto-posted once (prevents duplicates)
ALTER TABLE sm_posts
ADD COLUMN IF NOT EXISTS social_posted_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN sm_posts.social_caption IS 'Social media caption text (used above link card for FB/X). Does not include URL.';
COMMENT ON COLUMN sm_posts.social_posted_at IS 'Timestamp when auto-posted to social media. Non-null prevents re-posting.';
