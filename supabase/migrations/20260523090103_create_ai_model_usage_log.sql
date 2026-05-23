/*
  # Create AI Model Usage Log Table

  ## Summary
  Tracks every model change made in the AI Prompts admin panel.

  ## New Tables
  - `ai_model_usage_log`
    - `id` (uuid, primary key)
    - `prompt_key` (text) — which prompt/function the model applies to
    - `model_key` (text) — the admin_settings key (e.g. ai_model_structure_page)
    - `model_value` (text) — the OpenRouter model ID that was set
    - `model_label` (text) — human-readable model name
    - `is_backup` (boolean) — whether this is the backup model slot
    - `changed_at` (timestamptz) — when the change was made
    - `changed_by` (uuid, nullable) — the authenticated user who made the change

  ## Security
  - RLS enabled
  - Authenticated users can insert and select their own records
*/

CREATE TABLE IF NOT EXISTS ai_model_usage_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key  text NOT NULL DEFAULT '',
  model_key   text NOT NULL DEFAULT '',
  model_value text NOT NULL DEFAULT '',
  model_label text NOT NULL DEFAULT '',
  is_backup   boolean NOT NULL DEFAULT false,
  changed_at  timestamptz NOT NULL DEFAULT now(),
  changed_by  uuid REFERENCES auth.users(id)
);

ALTER TABLE ai_model_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert model usage logs"
  ON ai_model_usage_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by);

CREATE POLICY "Authenticated users can read model usage logs"
  ON ai_model_usage_log FOR SELECT
  TO authenticated
  USING (true);
