CREATE TABLE "geo_location" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"parent_id" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"merchant_id" text NOT NULL,
	"logo" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"active_deals" integer DEFAULT 0,
	"essay_status" text DEFAULT 'none' NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"total_sales" double precision DEFAULT 0,
	"rating" double precision DEFAULT 0,
	"location_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_merchant_id_unique" UNIQUE("merchant_id")
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "geo_location" ADD CONSTRAINT "geo_location_parent_id_geo_location_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."geo_location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant" ADD CONSTRAINT "merchant_location_id_geo_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."geo_location"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "geo_location_parent_id_idx" ON "geo_location" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "geo_location_type_idx" ON "geo_location" USING btree ("type");--> statement-breakpoint
CREATE INDEX "merchant_location_id_idx" ON "merchant" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "merchant_status_idx" ON "merchant" USING btree ("status");--> statement-breakpoint
CREATE INDEX "merchant_merchant_id_idx" ON "merchant" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "ticket_merchant_id_idx" ON "ticket" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "ticket" USING btree ("status");