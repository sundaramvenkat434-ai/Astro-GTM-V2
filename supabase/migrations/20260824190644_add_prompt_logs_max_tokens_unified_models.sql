/*
# Add per-prompt logging, max_tokens settings, and unified model list

## Summary
Adds three capabilities to the AI Prompts admin page:
1. Per-prompt max_tokens control -- each prompt gets its own max_tokens setting
   stored in admin_settings with key pattern `ai_max_tokens_<prompt_key>`.
2. Per-prompt request/response logging -- a new `ai_prompt_logs` table stores
   the latest 10 logs per prompt_key. A trigger automatically deletes older
   logs beyond the 10 newest, so the table never grows unbounded.
3. Per-prompt log enable/disable toggle -- stored in admin_settings with key
   pattern `ai_log_enabled_<prompt_key>`. When disabled, no logs are written.

## New Tables
- `ai_prompt_logs`
  - `id` (uuid, primary key)
  - `prompt_key` (text) -- which prompt/edge function produced this log
  - `model` (text) -- the OpenRouter model ID used
  - `input_content` (text) -- the user input sent to the model
  - `output_content` (text) -- the model's response
  - `finish_reason` (text) -- why the model stopped (stop, length, etc.)
  - `input_tokens` (integer) -- tokens consumed by the prompt
  - `output_tokens` (integer) -- tokens consumed by the completion
  - `elapsed_ms` (integer) -- wall-clock duration of the request
  - `created_at` (timestamptz) -- when the log was created

## New admin_settings keys seeded
- `ai_max_tokens_<prompt_key>` for each prompt (default 4000)
- `ai_log_enabled_<prompt_key>` for each prompt (default 'false')
- `openrouter_models` -- JSON array of ALL models (replaces built-in + custom split).
  Seeds the existing built-in models so the UI shows them uniformly.

## Security
- RLS enabled on `ai_prompt_logs`.
- Authenticated users can insert and read logs.
- A trigger function `trim_prompt_logs()` deletes all but the newest 10 rows
  per `prompt_key` after each insert.
*/

-- ── ai_prompt_logs table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_prompt_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key     text NOT NULL,
  model          text NOT NULL DEFAULT '',
  input_content  text NOT NULL DEFAULT '',
  output_content text NOT NULL DEFAULT '',
  finish_reason  text,
  input_tokens   integer NOT NULL DEFAULT 0,
  output_tokens  integer NOT NULL DEFAULT 0,
  elapsed_ms     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_prompt_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_insert_prompt_logs" ON ai_prompt_logs;
CREATE POLICY "auth_insert_prompt_logs"
  ON ai_prompt_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_prompt_logs" ON ai_prompt_logs;
CREATE POLICY "auth_select_prompt_logs"
  ON ai_prompt_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_delete_prompt_logs" ON ai_prompt_logs;
CREATE POLICY "auth_delete_prompt_logs"
  ON ai_prompt_logs FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_logs_prompt_key_created
  ON ai_prompt_logs (prompt_key, created_at DESC);

-- ── Auto-trim trigger: keep only newest 10 per prompt_key ──────────

CREATE OR REPLACE FUNCTION trim_prompt_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ai_prompt_logs
  WHERE prompt_key = NEW.prompt_key
    AND id NOT IN (
      SELECT id FROM ai_prompt_logs
      WHERE prompt_key = NEW.prompt_key
      ORDER BY created_at DESC
      LIMIT 10
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trim_prompt_logs ON ai_prompt_logs;
CREATE TRIGGER trg_trim_prompt_logs
  AFTER INSERT ON ai_prompt_logs
  FOR EACH ROW
  EXECUTE FUNCTION trim_prompt_logs();

-- ── Seed max_tokens and log_enabled for each prompt ───────────────

INSERT INTO admin_settings (key, value, updated_at)
VALUES
  ('ai_max_tokens_ai_content_cleanup_prompt',           '4000', now()),
  ('ai_log_enabled_ai_content_cleanup_prompt',           'false', now()),
  ('ai_max_tokens_ai_content_cleanup_prompt_v2',        '4000', now()),
  ('ai_log_enabled_ai_content_cleanup_prompt_v2',        'false', now()),
  ('ai_max_tokens_eeat_analysis_prompt',                '4000', now()),
  ('ai_log_enabled_eeat_analysis_prompt',                'false', now()),
  ('ai_max_tokens_top_x_slug_system_prompt',            '4000', now()),
  ('ai_log_enabled_top_x_slug_system_prompt',            'false', now()),
  ('ai_max_tokens_top_x_content_system_prompt',          '8000', now()),
  ('ai_log_enabled_top_x_content_system_prompt',          'false', now()),
  ('ai_max_tokens_top_x_content_system_prompt_v2',      '8000', now()),
  ('ai_log_enabled_top_x_content_system_prompt_v2',      'false', now()),
  ('ai_max_tokens_gifaa_article_generation_prompt',      '8000', now()),
  ('ai_log_enabled_gifaa_article_generation_prompt',      'false', now()),
  ('ai_max_tokens_brand_analyzer_prompt',                '8000', now()),
  ('ai_log_enabled_brand_analyzer_prompt',                'false', now()),
  ('ai_max_tokens_ai_keyword_research_prompt',           '8000', now()),
  ('ai_log_enabled_ai_keyword_research_prompt',           'false', now())
ON CONFLICT (key) DO NOTHING;

-- ── Seed unified openrouter_models (all models treated equally) ───

INSERT INTO admin_settings (key, value, updated_at)
VALUES (
  'openrouter_models',
  '[
    {"value":"stealth/ox-alpha","label":"Stealth Ox Alpha","provider":"OpenRouter"},
    {"value":"openai/gpt-oss-120b:free","label":"OpenAI GPT-OSS-120b","provider":"OpenRouter"},
    {"value":"openai/gpt-oss-20b:free","label":"OpenAI GPT-OSS-20b","provider":"OpenRouter"},
    {"value":"nvidia/nemotron-3-super-120b-a12b:free","label":"NVIDIA Nemotron 3 Super","provider":"OpenRouter"},
    {"value":"nvidia/nemotron-3.5-lightning:free","label":"NVIDIA Nemotron 3.5 Lightning","provider":"OpenRouter"},
    {"value":"minimax/minimax-m2.5:free","label":"MiniMax M2.5","provider":"OpenRouter"},
    {"value":"google/gemma-4-31b-it:free","label":"Google Gemma 4 31B","provider":"OpenRouter"}
  ]'::text,
  now()
)
ON CONFLICT (key) DO NOTHING;
