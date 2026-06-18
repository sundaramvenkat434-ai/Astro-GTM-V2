export interface KeywordVolumeEntry {
  keyword: string;
  avg_monthly_searches: string;
  competition: string;
  volume_anchor: number;
  source: string;
}

export const KEYWORD_VOLUME_REFERENCE: KeywordVolumeEntry[] = [
  { keyword: "ai agent", avg_monthly_searches: "10K-100K", competition: "Medium", volume_anchor: 50000, source: "google_keyword_planner" },
  { keyword: "ai assistant", avg_monthly_searches: "100K-1M", competition: "Low", volume_anchor: 500000, source: "google_keyword_planner" },
  { keyword: "ai automation tool", avg_monthly_searches: "1K-10K", competition: "Medium", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "ai chatbot", avg_monthly_searches: "100K-1M", competition: "Low", volume_anchor: 500000, source: "google_keyword_planner" },
  { keyword: "ai customer support agent", avg_monthly_searches: "10-100", competition: "Medium", volume_anchor: 50, source: "google_keyword_planner" },
  { keyword: "ai email assistant", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500, source: "google_keyword_planner" },
  { keyword: "ai meeting assistant", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500, source: "google_keyword_planner" },
  { keyword: "ai recruiter", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "ai sales agent", avg_monthly_searches: "100-1K", competition: "Medium", volume_anchor: 500, source: "google_keyword_planner" },
  { keyword: "ai tools", avg_monthly_searches: "100K-1M", competition: "Medium", volume_anchor: 500000, source: "google_keyword_planner" },
  { keyword: "crm software", avg_monthly_searches: "10K-100K", competition: "Low", volume_anchor: 50000, source: "google_keyword_planner" },
  { keyword: "client portal software", avg_monthly_searches: "10-100", competition: "Low", volume_anchor: 50, source: "google_keyword_planner" },
  { keyword: "document organizer", avg_monthly_searches: "100-1K", competition: "High", volume_anchor: 500, source: "google_keyword_planner" },
  { keyword: "document management software", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "gift registry", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500, source: "google_keyword_planner" },
  { keyword: "wedding registry", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500, source: "google_keyword_planner" },
  { keyword: "budget planner", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "expense tracker", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "invoice generator", avg_monthly_searches: "10K-100K", competition: "Low", volume_anchor: 50000, source: "google_keyword_planner" },
  { keyword: "resume builder", avg_monthly_searches: "100K-1M", competition: "Medium", volume_anchor: 500000, source: "google_keyword_planner" },
  { keyword: "fitness app", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "habit tracker", avg_monthly_searches: "10K-100K", competition: "Medium", volume_anchor: 50000, source: "google_keyword_planner" },
  { keyword: "workflow automation", avg_monthly_searches: "1K-10K", competition: "Medium", volume_anchor: 5000, source: "google_keyword_planner" },
  { keyword: "hr software", avg_monthly_searches: "10K-100K", competition: "Medium", volume_anchor: 50000, source: "google_keyword_planner" },
  { keyword: "email marketing software", avg_monthly_searches: "10K-100K", competition: "Low", volume_anchor: 50000, source: "google_keyword_planner" },
];
