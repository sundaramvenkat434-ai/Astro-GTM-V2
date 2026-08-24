/*
# Create free_audits and free_audit_rate_limits tables with atomic rate-limit RPC

## Purpose
Supports a public (no-login) free SEO audit flow on the AstroRank landing page.
Visitors enter their website URL, get redirected to a unique audit results page,
and can run brand analysis + SERP competitor research without signing up.

## New Tables

### free_audits
- `id` (uuid, PK, default gen_random_uuid()) — serves as the unguessable access token
- `website_url` (text, not null) — the URL the visitor entered
- `status` (text, default 'pending') — pending | analyzing | complete | error
- `brand_analysis` (jsonb) — 8 flat brand intelligence fields from OpenRouter
- `serp_results` (jsonb) — Google SERP results from Apify
- `scraped_competitors` (jsonb) — cleaned text content of competitor pages
- `error_message` (text) — error details if status is 'error'
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### free_audit_rate_limits
- `id` (uuid, PK, default gen_random_uuid())
- `ip_address` (text, not null) — caller IP
- `action` (text, not null) — create | analyze-brand | search-serp | scrape-competitors | get
- `count` (int, default 0) — requests in current window
- `window_start` (timestamptz, default now()) — start of current rate-limit window
- Unique index on (ip_address, action) so only one row per IP+action pair

## Security
- RLS enabled on both tables.
- ALL access denied for anon and authenticated roles — no SELECT, INSERT, UPDATE, or DELETE.
- All reads/writes go through the free-audit edge function using the service role key.

## RPC Function: check_free_audit_rate_limit
- SECURITY DEFINER function that atomically checks and increments the rate-limit counter.
- Locks the row with SELECT ... FOR UPDATE to prevent race conditions.
- If the window has expired, resets count to 1 and window_start to now.
- If count >= max, returns { allowed: false, current_count, reset_in_seconds }.
- Otherwise increments count and returns { allowed: true, current_count, reset_in_seconds }.
*/

-- ═══════════════════════════════════════════════════════════════
-- Table: free_audits
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS free_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  brand_analysis jsonb DEFAULT '{}'::jsonb,
  serp_results jsonb DEFAULT '[]'::jsonb,
  scraped_competitors jsonb DEFAULT '[]'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE free_audits ENABLE ROW LEVEL SECURITY;

-- Deny all access for anon and authenticated — edge function uses service role key
DROP POLICY IF EXISTS "deny_all_free_audits" ON free_audits;
CREATE POLICY "deny_all_free_audits" ON free_audits
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════════
-- Table: free_audit_rate_limits
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS free_audit_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  action text NOT NULL,
  count int NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_ip_action UNIQUE (ip_address, action)
);

ALTER TABLE free_audit_rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all access for anon and authenticated — edge function uses service role key
DROP POLICY IF EXISTS "deny_all_free_audit_rate_limits" ON free_audit_rate_limits;
CREATE POLICY "deny_all_free_audit_rate_limits" ON free_audit_rate_limits
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════════
-- RPC: check_free_audit_rate_limit (atomic, race-condition-safe)
-- ═══════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS check_free_audit_rate_limit(text, text, integer, integer);

CREATE OR REPLACE FUNCTION check_free_audit_rate_limit(
  p_ip text,
  p_action text,
  p_max_count int,
  p_window_seconds int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_window_start timestamptz;
  v_now timestamptz := now();
  v_allowed boolean := false;
  v_reset_in int;
BEGIN
  -- Try to lock existing row
  SELECT count, window_start INTO v_count, v_window_start
  FROM free_audit_rate_limits
  WHERE ip_address = p_ip AND action = p_action
  FOR UPDATE;

  IF NOT FOUND THEN
    -- No row yet — insert a fresh one with count = 1
    INSERT INTO free_audit_rate_limits (ip_address, action, count, window_start)
    VALUES (p_ip, p_action, 1, v_now)
    ON CONFLICT (ip_address, action) DO NOTHING;

    -- If conflict happened (another concurrent request inserted), lock and check
    IF NOT FOUND THEN
      SELECT count, window_start INTO v_count, v_window_start
      FROM free_audit_rate_limits
      WHERE ip_address = p_ip AND action = p_action
      FOR UPDATE;

      IF v_window_start < v_now - (p_window_seconds || ' seconds')::interval THEN
        -- Window expired — reset
        UPDATE free_audit_rate_limits SET count = 1, window_start = v_now
        WHERE ip_address = p_ip AND action = p_action;
        v_count := 1;
        v_allowed := true;
      ELSIF v_count < p_max_count THEN
        UPDATE free_audit_rate_limits SET count = count + 1
        WHERE ip_address = p_ip AND action = p_action;
        v_count := v_count + 1;
        v_allowed := true;
      ELSE
        v_allowed := false;
      END IF;
    ELSE
      v_count := 1;
      v_allowed := true;
    END IF;
  ELSE
    -- Row exists — check window
    IF v_window_start < v_now - (p_window_seconds || ' seconds')::interval THEN
      -- Window expired — reset
      UPDATE free_audit_rate_limits SET count = 1, window_start = v_now
      WHERE ip_address = p_ip AND action = p_action;
      v_count := 1;
      v_allowed := true;
    ELSIF v_count < p_max_count THEN
      UPDATE free_audit_rate_limits SET count = count + 1
      WHERE ip_address = p_ip AND action = p_action;
      v_count := v_count + 1;
      v_allowed := true;
    ELSE
      v_allowed := false;
    END IF;
  END IF;

  -- Calculate seconds until window resets
  IF v_allowed THEN
    v_reset_in := p_window_seconds;
  ELSE
    SELECT GREATEST(0, EXTRACT(EPOCH FROM (v_window_start + (p_window_seconds || ' seconds')::interval - v_now))::int)
    INTO v_reset_in;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_count,
    'reset_in_seconds', v_reset_in
  );
END;
$$;

-- Grant execute to anon so the edge function (service role) can call it
GRANT EXECUTE ON FUNCTION check_free_audit_rate_limit TO anon, authenticated;