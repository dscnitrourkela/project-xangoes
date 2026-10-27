CREATE TABLE "admins" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"firebase_id" varchar(255) NOT NULL,
	"is_super_admin" boolean DEFAULT false,
	"fest_id" varchar(255),
	"is_deleted" boolean DEFAULT false,
	"allowed_to_modify_content" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email"),
	CONSTRAINT "admins_firebase_id_unique" UNIQUE("firebase_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "mobile" DROP NOT NULL;