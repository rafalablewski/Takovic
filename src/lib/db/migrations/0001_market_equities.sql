CREATE TABLE "market_equities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"name" varchar(255) NOT NULL,
	"exchange" varchar(64) NOT NULL,
	"country" varchar(2) NOT NULL,
	"region" varchar(8) NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"sector" varchar(100),
	"industry" varchar(100),
	"price" numeric NOT NULL,
	"change_pct" numeric,
	"volume" numeric,
	"market_cap" numeric,
	"pe_ratio" numeric,
	"roe" numeric,
	"dividend_yield" numeric,
	"composite_score" numeric,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "market_equities_symbol_exchange_idx" ON "market_equities" USING btree ("symbol","exchange");--> statement-breakpoint
CREATE INDEX "market_equities_region_idx" ON "market_equities" USING btree ("region");--> statement-breakpoint
CREATE INDEX "market_equities_sector_idx" ON "market_equities" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "market_equities_market_cap_idx" ON "market_equities" USING btree ("market_cap");