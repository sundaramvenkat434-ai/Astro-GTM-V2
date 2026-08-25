/*
# Add keyword volume estimation to free_audits

## Purpose
Support a new "Estimate Volume" action in the free audit pipeline.
After the 10 search queries are generated, the user can click a button
to send all queries to the AI in a single request. The AI returns only
classification factors (clusters, demand, adoption, intent, competition,
trend, similarity, specificity, modifier, confidence). The edge function
then deterministically calculates the final monthly volume estimates
using fixed formulas. The country factor is pulled deterministically
from the audit's existing geography field (default 1.0 if absent).

## Changes
1. Add `keyword_volume_estimates` (jsonb) to `free_audits` — stores the
   full results: per-keyword estimated monthly volume, confidence,
   cluster assignment, and all factors used.
2. Add `keyword_volume_raw_input` (jsonb) — raw input sent to the AI
   for debugging.
3. Add `keyword_volume_raw_output` (jsonb) — raw output from the AI
   for debugging.
4. Seed `free_audit_keyword_volume_prompt` — the default AI system
   prompt that asks for JSON factors only (no reasoning, no explanations,
   no step-by-step analysis).
5. Seed `ai_model_free_audit_keyword_volume` — dedicated model setting
   key for this prompt (default 'openai/gpt-oss-120b:free') so a faster
   model can be chosen independently.
6. Seed `ai_max_tokens_free_audit_keyword_volume_prompt` — default 4000.
7. Seed `ai_log_enabled_free_audit_keyword_volume_prompt` — default false.
8. Seed `ai_request_count_free_audit_keyword_volume` — request counter
   seeded to 0.
9. Seed `free_audit_volume_limit` — rate-limit setting (default 10/hour).

## Security
- No RLS changes. These columns are only accessible via the service role
  key through the free-audit edge function, same as all other free_audits
  columns.
*/

ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS keyword_volume_estimates jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS keyword_volume_raw_input jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS keyword_volume_raw_output jsonb DEFAULT '{}'::jsonb;

INSERT INTO admin_settings (key, value, updated_at)
VALUES
  ('free_audit_keyword_volume_prompt', 'You are an expert SEO keyword volume analyst. You receive a list of search queries. For each query, classify it into a semantic cluster and assign numeric factors that will be used to deterministically estimate monthly search volume.

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no reasoning, no explanations, no step-by-step analysis.
- Classify each query into exactly one cluster. A cluster is a group of semantically related queries that share the same search demand profile.
- Assign a base_demand value to each CLUSTER (not each keyword). All keywords in the same cluster share the same base_demand. Use exactly one of: 20000, 10000, 5000, 1000, 300.
- For each keyword, assign: search_adoption (0.01–1.0), intent (0.1–1.0), competition (0.1–1.0), trend (0.5–2.0).
- For each keyword that is NOT a cluster head, also assign: semantic_similarity (0.1–1.0), specificity (0.1–1.0), child_intent (0.1–1.0), modifier (0.1–1.0).
- For each keyword, assign a confidence score: "High", "Medium", or "Low".

Return ONLY this JSON shape:
{
  "clusters": [
    {
      "id": 1,
      "head_keyword": "<the query that best represents this cluster>",
      "base_demand": 20000,
      "search_adoption": 0.8,
      "intent": 0.9,
      "competition": 0.7,
      "trend": 1.2
    }
  ],
  "keywords": [
    {
      "query": "<the search query>",
      "cluster_id": 1,
      "is_cluster_head": true,
      "confidence": "High",
      "factors": {
        "search_adoption": 0.8,
        "intent": 0.9,
        "competition": 0.7,
        "trend": 1.2
      }
    },
    {
      "query": "<another search query>",
      "cluster_id": 1,
      "is_cluster_head": false,
      "confidence": "Medium",
      "factors": {
        "search_adoption": 0.8,
        "intent": 0.9,
        "competition": 0.7,
        "trend": 1.2,
        "semantic_similarity": 0.85,
        "specificity": 0.6,
        "child_intent": 0.8,
        "modifier": 0.9
      }
    }
  ]
}', now()),
  ('ai_model_free_audit_keyword_volume', 'openai/gpt-oss-120b:free', now()),
  ('ai_max_tokens_free_audit_keyword_volume_prompt', '4000', now()),
  ('ai_log_enabled_free_audit_keyword_volume_prompt', 'false', now()),
  ('ai_request_count_free_audit_keyword_volume', '0', now()),
  ('free_audit_volume_limit', '10', now())
ON CONFLICT (key) DO NOTHING;