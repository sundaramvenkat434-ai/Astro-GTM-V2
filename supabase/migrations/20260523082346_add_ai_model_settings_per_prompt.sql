/*
  # Add AI model settings per prompt / edge function

  1. Changes
    - Seeds `admin_settings` with per-function model keys so the prompts admin
      page can show a model switcher alongside every prompt card.
    - Primary model: `openai/gpt-oss-120b:free` (OpenRouter)
    - Backup model: `google/gemma-4-31b-it:free` (OpenRouter)
    - Request counters seeded to 0 for each function key.

  2. New keys
    - `ai_model_structure_page`     – model used by structure-page function
    - `ai_model_run_eeat`           – model used by run-eeat function
    - `ai_model_format_seo`         – model used by format-seo function
    - `ai_model_generate_top_x`     – model used by generate-top-x function
    - `ai_model_generate_comparison`– model used by generate-comparison function
    - `ai_model_backup`             – shared OpenRouter backup model for all functions
    - `ai_request_count_structure_page`
    - `ai_request_count_run_eeat`
    - `ai_request_count_format_seo`
    - `ai_request_count_generate_top_x`
    - `ai_request_count_generate_comparison`
*/

INSERT INTO admin_settings (key, value, updated_at)
VALUES
  ('ai_model_structure_page',      'openai/gpt-oss-120b:free',   now()),
  ('ai_model_run_eeat',            'openai/gpt-oss-120b:free',   now()),
  ('ai_model_format_seo',          'openai/gpt-oss-120b:free',   now()),
  ('ai_model_generate_top_x',      'openai/gpt-4o-mini',         now()),
  ('ai_model_generate_comparison', 'openai/gpt-4o-mini',         now()),
  ('ai_model_backup',              'google/gemma-4-31b-it:free', now()),
  ('ai_request_count_structure_page',      '0', now()),
  ('ai_request_count_run_eeat',            '0', now()),
  ('ai_request_count_format_seo',          '0', now()),
  ('ai_request_count_generate_top_x',      '0', now()),
  ('ai_request_count_generate_comparison', '0', now())
ON CONFLICT (key) DO NOTHING;
