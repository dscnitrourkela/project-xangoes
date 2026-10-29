CREATE TABLE "team_invitations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"team_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"invited_by" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "reviewed_by" varchar(255);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "metadata" json;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "status" varchar(50) DEFAULT 'CONFIRMED' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_invitations_team_id_idx" ON "team_invitations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_invitations_user_id_idx" ON "team_invitations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_invitations_invited_by_idx" ON "team_invitations" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "team_invitations_status_idx" ON "team_invitations" USING btree ("status");