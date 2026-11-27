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
