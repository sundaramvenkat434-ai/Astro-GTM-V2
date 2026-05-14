/*
  # Seed Top X V2 Content System Prompt

  1. Changes
    - Inserts the `top_x_content_system_prompt_v2` key into `admin_settings`
    - This prompt is used by the generate-top-x edge function when version="v2" is
      passed (i.e. from the "Create Top X 2.0 Page" admin flow)
    - Admins can edit this prompt freely in the AI Prompts settings page
    - Uses INSERT ... ON CONFLICT DO NOTHING so re-running is safe

  2. Notes
    - The V2 prompt starts as a copy of the V1 default so it is immediately usable
    - Admins should customise it to A/B test different output styles
*/

INSERT INTO admin_settings (key, value)
VALUES (
  'top_x_content_system_prompt_v2',
  'You are a senior technical writer creating high-quality "Top X" comparison pages for a developer tools directory. You write in a clear, authoritative, helpful style. Output ONLY valid JSON, no markdown fences.'
)
ON CONFLICT (key) DO NOTHING;
