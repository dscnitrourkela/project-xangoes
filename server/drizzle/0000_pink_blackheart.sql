CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."college_status" AS ENUM('BLACKLISTED', 'ALLOWED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."fest_status" AS ENUM('ACTIVE', 'DRAFT', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."club_sub_type" AS ENUM('TECHNICAL', 'CULTURAL', 'SPORTS', 'HACKATHON', 'LITERARY', 'FMS');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('ACTIVE', 'DRAFT', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."repeat_day" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');--> statement-breakpoint
CREATE TYPE "public"."institute_college_status" AS ENUM('BLACKLISTED', 'ALLOWED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('REGISTRATION', 'MERCH', 'EVENT');--> statement-breakpoint
CREATE TYPE "public"."club_member_role" AS ENUM('MEMBER', 'CORE', 'COORDINATOR', 'LEAD');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"photo" text,
	"gender" "gender",
	"dob" timestamp,
	"state" varchar(100),
	"city" varchar(100),
	"college" varchar(255),
	"id_card" text,
	"mobile" varchar(20) NOT NULL,
	"fest_id" varchar(255),
	"roll_number" varchar(50),
	"firebase_id" varchar(255) NOT NULL,
	"has_paid" boolean DEFAULT false,
	"receipt" text,
	"transaction_id" varchar(255),
	"hall" varchar(100),
	"extra_details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_mobile_unique" UNIQUE("mobile"),
	CONSTRAINT "users_firebase_id_unique" UNIQUE("firebase_id")
);
--> statement-breakpoint
CREATE TABLE "fests" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"tagline" varchar(500),
	"logo" text,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "fest_status" DEFAULT 'ACTIVE',
	"registration_fee" integer,
	"college_status" "college_status" DEFAULT 'ALLOWED',
	"society" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"sub_type" "club_sub_type" NOT NULL,
	"description" text,
	"logo" text,
	"events" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"sub_heading" varchar(500),
	"prize_money" json,
	"type" varchar(100),
	"description" text NOT NULL,
	"poster" text NOT NULL,
	"rules" text[] NOT NULL,
	"location" varchar(255),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"club_id" varchar(255),
	"contact" text[] NOT NULL,
	"poc_id" text[] NOT NULL,
	"weekly" boolean DEFAULT false,
	"repeat_day" "repeat_day",
	"priority" integer DEFAULT 1,
	"status" "event_status" DEFAULT 'DRAFT',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"logo" text,
	"college_status" "institute_college_status",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"amount" integer,
	"user_id" varchar(255) NOT NULL,
	"transaction_id" varchar(255),
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"fest_id" varchar(255),
	"comment" text,
	"screenshot" text,
	"provider" varchar(50) DEFAULT 'RAZORPAY' NOT NULL,
	"provider_order_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"team_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"members" text[],
	"fest_id" varchar(255) NOT NULL,
	"club_id" varchar(255) NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"team_lead" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_members" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"club_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" "club_member_role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_college_institutes_id_fk" FOREIGN KEY ("college") REFERENCES "public"."institutes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_fest_id_fests_id_fk" FOREIGN KEY ("fest_id") REFERENCES "public"."fests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fest_id_fests_id_fk" FOREIGN KEY ("fest_id") REFERENCES "public"."fests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_fest_id_fests_id_fk" FOREIGN KEY ("fest_id") REFERENCES "public"."fests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_lead_users_id_fk" FOREIGN KEY ("team_lead") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_college_idx" ON "users" USING btree ("college");--> statement-breakpoint
CREATE INDEX "users_fest_id_idx" ON "users" USING btree ("fest_id");--> statement-breakpoint
CREATE INDEX "users_transaction_id_idx" ON "users" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "events_club_id_idx" ON "events" USING btree ("club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_provider_order_unique" ON "transactions" USING btree ("provider","provider_order_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_fest_id_idx" ON "transactions" USING btree ("fest_id");--> statement-breakpoint
CREATE INDEX "transactions_transaction_id_idx" ON "transactions" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transactions_provider_order_id_idx" ON "transactions" USING btree ("provider_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_user_event_unique" ON "event_registrations" USING btree ("user_id","event_id");--> statement-breakpoint
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_registrations_user_id_idx" ON "event_registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_registrations_team_id_idx" ON "event_registrations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "teams_fest_id_idx" ON "teams" USING btree ("fest_id");--> statement-breakpoint
CREATE INDEX "teams_club_id_idx" ON "teams" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "teams_event_id_idx" ON "teams" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "teams_team_lead_idx" ON "teams" USING btree ("team_lead");--> statement-breakpoint
CREATE UNIQUE INDEX "club_members_club_user_unique" ON "club_members" USING btree ("club_id","user_id");--> statement-breakpoint
CREATE INDEX "club_members_club_id_idx" ON "club_members" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "club_members_user_id_idx" ON "club_members" USING btree ("user_id");