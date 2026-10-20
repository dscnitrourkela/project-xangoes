ALTER TABLE "users" DROP CONSTRAINT "users_uid_unique";--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "team_id" varchar(255);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "members" text[];--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "fest_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "event_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "team_lead" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firebase_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "fests" DROP COLUMN "theme";--> statement-breakpoint
ALTER TABLE "institutes" DROP COLUMN "registrations";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "team";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stream";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "self_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ca";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "referred_by";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_firebase_id_unique" UNIQUE("firebase_id");