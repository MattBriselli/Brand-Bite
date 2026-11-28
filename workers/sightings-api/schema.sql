-- Cloudflare D1 Schema for BrandBite Community Sightings
CREATE TABLE IF NOT EXISTS sightings (
  id TEXT PRIMARY KEY,
  brand_slug TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  sighting_type TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  price TEXT,
  notes TEXT NOT NULL,
  spotted_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sightings_status_created
  ON sightings (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sightings_brand_status
  ON sightings (brand_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sightings_ip_created
  ON sightings (ip_hash, created_at DESC);

-- Cloudflare D1 Schema for Fully Pseudonymized Article Comments (Zero PII)
-- pseudo_id is a one-way keyed HMAC-SHA256 derived using a Worker Secret.
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  article_slug TEXT NOT NULL,
  pseudo_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  is_author INTEGER NOT NULL DEFAULT 0,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_slug_status_created
  ON comments (article_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_pseudo_created
  ON comments (pseudo_id, created_at DESC);

-- Cloudflare D1 Schema for Fully Pseudonymized Comment Likes (Zero PII)
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id TEXT NOT NULL,
  pseudo_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (comment_id, pseudo_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment
  ON comment_likes (comment_id);

-- Cloudflare D1 Schema for "I Tried It" / "Want to Try" Special Reactions
CREATE TABLE IF NOT EXISTS reactions (
  item_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (item_id, reaction_type, voter_hash)
);

CREATE INDEX IF NOT EXISTS idx_reactions_item
  ON reactions (item_id, reaction_type);

-- Cloudflare D1 Schema for Card-Level Click Tracking (Trending Signal)
CREATE TABLE IF NOT EXISTS card_clicks (
  item_id TEXT NOT NULL,
  brand_slug TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  day_bucket TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (item_id, voter_hash, day_bucket)
);

CREATE INDEX IF NOT EXISTS idx_card_clicks_created
  ON card_clicks (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_card_clicks_item
  ON card_clicks (item_id, created_at DESC);

-- Cloudflare D1 Schema for Fully Pseudonymized Upvotes (No Downvotes, Zero PII)
CREATE TABLE IF NOT EXISTS upvotes (
  item_id TEXT NOT NULL,
  pseudo_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (item_id, pseudo_id)
);

CREATE INDEX IF NOT EXISTS idx_upvotes_item
  ON upvotes (item_id);

CREATE INDEX IF NOT EXISTS idx_upvotes_created
  ON upvotes (created_at DESC);

-- Cloudflare D1 Schema for Pseudonymized Users (New vs Returning Tracking, Zero PII)
CREATE TABLE IF NOT EXISTS users (
  pseudo_id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  is_author INTEGER NOT NULL DEFAULT 0,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  login_count INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_users_last_seen
  ON users (last_seen_at DESC);

CREATE TABLE IF NOT EXISTS user_login_days (
  pseudo_id TEXT NOT NULL,
  day_bucket TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (pseudo_id, day_bucket)
);

CREATE INDEX IF NOT EXISTS idx_user_login_days_day
  ON user_login_days (day_bucket DESC);

-- Cloudflare D1 Schema for Auth-State Pageview Telemetry (Logged In vs Logged Out, Zero PII)
CREATE TABLE IF NOT EXISTS auth_pageviews_hourly (
  hour_bucket TEXT NOT NULL,
  auth_state TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  visits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hour_bucket, auth_state)
);

CREATE TABLE IF NOT EXISTS auth_pageviews_paths (
  day_bucket TEXT NOT NULL,
  auth_state TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day_bucket, auth_state, path)
);

CREATE TABLE IF NOT EXISTS auth_pageviews_geo (
  day_bucket TEXT NOT NULL,
  auth_state TEXT NOT NULL,
  country TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day_bucket, auth_state, country)
);

CREATE TABLE IF NOT EXISTS auth_pageviews_visitors (
  day_bucket TEXT NOT NULL,
  auth_state TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day_bucket, auth_state, visitor_hash)
);
