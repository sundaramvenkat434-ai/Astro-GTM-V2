/*
# Add custom OpenRouter models setting

1. Changes
   - Seeds `admin_settings` with key `openrouter_custom_models` containing
     an empty JSON array `[]`. This key stores user-added OpenRouter model
     definitions (each with value, label, provider) so they appear in the
     model switcher dropdown on the AI Prompts admin page alongside the
     built-in models.

2. No new tables or columns.
3. No security changes.
*/

INSERT INTO admin_settings (key, value, updated_at)
VALUES ('openrouter_custom_models', '[]', now())
ON CONFLICT (key) DO NOTHING;
