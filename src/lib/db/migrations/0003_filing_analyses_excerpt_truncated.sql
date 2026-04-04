-- filing_analyses: persist whether SEC document text was capped before AI (FILING_AI_MAX_CHARS / byte cap).
-- Safe to run more than once.
ALTER TABLE "filing_analyses"
  ADD COLUMN IF NOT EXISTS "excerpt_truncated" boolean DEFAULT false NOT NULL;
