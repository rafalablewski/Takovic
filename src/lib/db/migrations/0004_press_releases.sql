CREATE TABLE IF NOT EXISTS "press_releases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ticker" varchar(10) NOT NULL,
  "source" varchar(100) NOT NULL,
  "external_id" varchar(128) NOT NULL,
  "headline" text NOT NULL,
  "summary" text,
  "published_at" timestamp NOT NULL,
  "url" text,
  "raw_payload" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "press_releases_ticker_source_external_idx"
  ON "press_releases" USING btree ("ticker","source","external_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "press_releases_ticker_idx"
  ON "press_releases" USING btree ("ticker");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "press_releases_published_idx"
  ON "press_releases" USING btree ("published_at");
