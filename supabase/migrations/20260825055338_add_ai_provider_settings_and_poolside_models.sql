/*
# Add AI provider settings per prompt + Poolside models list

1. New Settings
- ai_provider_<prompt_key> for all 12 AI prompts in the admin UI, defaulting to 'openrouter'
- poolside_models setting containing poolside/laguna-s-2.1

2. Notes
- Uses ON CONFLICT DO NOTHING to avoid overwriting existing settings
- All prompts default to OpenRouter, preserving existing behavior
- Poolside models list starts with poolside/laguna-s-2.1
- No schema changes — only inserts rows into the existing admin_settings table
*/

INSERT INTO admin_settings (key, value, updated_at) VALUES
  ('ai_provider_ai_content_cleanup_prompt', 'openrouter', now()),
  ('ai_provider_ai_content_cleanup_prompt_v2', 'openrouter', now()),
  ('ai_provider_eeat_analysis_prompt', 'openrouter', now()),
  ('ai_provider_top_x_slug_system_prompt', 'openrouter', now()),
  ('ai_provider_top_x_content_system_prompt', 'openrouter', now()),
  ('ai_provider_top_x_content_system_prompt_v2', 'openrouter', now()),
  ('ai_provider_gifaa_article_generation_prompt', 'openrouter', now()),
  ('ai_provider_brand_analyzer_prompt', 'openrouter', now()),
  ('ai_provider_ai_keyword_research_prompt', 'openrouter', now()),
  ('ai_provider_free_audit_search_queries_prompt', 'openrouter', now()),
  ('ai_provider_free_audit_understander_prompt', 'openrouter', now()),
  ('ai_provider_free_audit_keyword_volume_prompt', 'openrouter', now())
ON CONFLICT (key) DO NOTHING;

INSERT INTO admin_settings (key, value, updated_at) VALUES
  ('poolside_models', '[{"value":"poolside/laguna-s-2.1","label":"Laguna S 2.1","provider":"Poolside"}]', now())
ON CONFLICT (key) DO NOTHING;
