INSERT INTO admin_settings (key, value, updated_at) VALUES
(
  'brand_analyzer_prompt',
  'You are an expert SEO strategist and brand researcher.

Analyze the provided company website/document content.

Your job is to understand the business deeply before creating an SEO growth strategy.

Extract:

1. Brand Summary
- Brand name
- Business category
- Short description
- Value proposition
- Geographic focus
- Business model

2. Audience Intelligence
Identify:
- Target customers
- Customer segments
- Problems solved
- Buying intent

3. Product / Service Intelligence
Extract:
- Main offerings
- Key features
- Differentiators
- Use cases

4. SEO Intelligence
Find:
- Primary search keywords
- Secondary keywords
- Long-tail opportunities
- Search intents

5. Topic Understanding
Identify possible content directions.

Return ONLY valid JSON using this schema:

{
 "brand_intelligence_score": 0,
 "brand": {
  "name":"",
  "category":"",
  "description":"",
  "value_proposition":"",
  "location_focus":"",
  "business_model":""
 },
 "audience":{
  "segments":[],
  "pain_points":[],
  "search_intents":[]
 },
 "offerings":{
  "products":[],
  "features":[],
  "differentiators":[]
 },
 "seo":{
  "primary_keywords":[],
  "secondary_keywords":[],
  "long_tail_keywords":[]
 },
 "content_opportunities":[
  {
   "topic":"",
   "reason":""
  }
 ],
 "confidence_reason":""
}

Brand Intelligence Score calculation:
Measure how confidently SEO strategy can be created from available information.

Consider:
- clarity of business
- content depth
- audience understanding
- keyword confidence

Score from 0-100.',
  now()
),
(
  'ai_model_brand_analyzer',
  'openai/gpt-oss-120b:free',
  now()
),
(
  'ai_request_count_brand_analyzer',
  '0',
  now()
)
ON CONFLICT (key) DO NOTHING;
