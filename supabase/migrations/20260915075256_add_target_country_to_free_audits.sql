/*
# Add target_country column to free_audits table

## Purpose
Allows users to select a target country for their free SEO audit, so that
search volume estimates in the Page Ideas tab reflect the selected country
rather than defaulting to global/US-only numbers.

## Changes
- Adds `target_country` (text, default 'us') to `free_audits`.
  Stores an ISO 3166-1 alpha-2 country code (e.g. "us", "gb", "in", "de").

## Security
- No new tables. Existing RLS policies on free_audits remain unchanged.
*/

ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS target_country text NOT NULL DEFAULT 'us';
