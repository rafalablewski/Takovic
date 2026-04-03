CREATE TABLE "filing_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filing_fingerprint" varchar(128) NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"accession_number" varchar(32),
	"form" varchar(32) NOT NULL,
	"filing_date" varchar(16) NOT NULL,
	"source" varchar(8) NOT NULL,
	"document_url" text NOT NULL,
	"company_name" text,
	"summary" text NOT NULL,
	"key_points" text[],
	"sentiment" "sentiment",
	"ai_provider" varchar(20) NOT NULL,
	"model" varchar(128),
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "filing_analyses_fingerprint_idx" ON "filing_analyses" ("filing_fingerprint");
--> statement-breakpoint
CREATE INDEX "filing_analyses_ticker_idx" ON "filing_analyses" ("ticker");
