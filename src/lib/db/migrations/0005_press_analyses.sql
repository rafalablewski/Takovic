CREATE TABLE IF NOT EXISTS "press_analyses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "press_fingerprint" varchar(512) NOT NULL,
  "ticker" varchar(10) NOT NULL,
  "title" text NOT NULL,
  "published_at" varchar(64),
  "source" varchar(120),
  "url" text,
  "pasted_text" text,
  "analysis" text NOT NULL,
  "ai_provider" varchar(20) NOT NULL,
  "model" varchar(128),
  "analyzed_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "press_analyses_fingerprint_idx"
  ON "press_analyses" ("press_fingerprint");
CREATE INDEX IF NOT EXISTS "press_analyses_ticker_idx"
  ON "press_analyses" ("ticker");

