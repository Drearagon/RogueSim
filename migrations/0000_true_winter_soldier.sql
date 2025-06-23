CREATE TABLE "command_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" varchar,
	"command" text NOT NULL,
	"args" text[] DEFAULT '{}',
	"success" boolean NOT NULL,
	"output" text[] NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_saves" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"game_mode" text DEFAULT 'single' NOT NULL,
	"current_mission" integer DEFAULT 0 NOT NULL,
	"credits" integer DEFAULT 1000 NOT NULL,
	"reputation" text DEFAULT 'ROOKIE' NOT NULL,
	"completed_missions" integer DEFAULT 0 NOT NULL,
	"unlocked_commands" text[] DEFAULT '{"help","scan","connect","status","clear","man"}' NOT NULL,
	"mission_progress" integer DEFAULT 0 NOT NULL,
	"network_status" text DEFAULT 'DISCONNECTED' NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"is_boot_complete" boolean DEFAULT false NOT NULL,
	"current_network" text,
	"inventory" text[] DEFAULT '{}' NOT NULL,
	"skill_tree" jsonb DEFAULT '{}'::jsonb,
	"session_id" text NOT NULL,
	"last_saved" timestamp DEFAULT now() NOT NULL,
	"game_data" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "mission_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" varchar,
	"mission_id" integer NOT NULL,
	"title" text NOT NULL,
	"objective" text NOT NULL,
	"status" text NOT NULL,
	"difficulty" text NOT NULL,
	"reward" integer NOT NULL,
	"time_limit" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "multiplayer_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" varchar(8) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"host_user_id" varchar NOT NULL,
	"max_players" integer DEFAULT 4 NOT NULL,
	"current_players" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"game_mode" text DEFAULT 'cooperative' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "multiplayer_rooms_room_code_unique" UNIQUE("room_code")
);
--> statement-breakpoint
CREATE TABLE "player_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"total_play_time" integer DEFAULT 0 NOT NULL,
	"total_missions" integer DEFAULT 0 NOT NULL,
	"favorite_commands" text[] DEFAULT '{}',
	"achievements_unlocked" text[] DEFAULT '{}',
	"multiplayer_wins" integer DEFAULT 0 NOT NULL,
	"multiplayer_losses" integer DEFAULT 0 NOT NULL,
	"best_completion_time" integer,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "player_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unverified_users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"hacker_name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unverified_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"hacker_name" varchar,
	"player_level" integer DEFAULT 1 NOT NULL,
	"total_missions_completed" integer DEFAULT 0 NOT NULL,
	"total_credits_earned" integer DEFAULT 0 NOT NULL,
	"reputation" text DEFAULT 'ROOKIE' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"last_active" timestamp DEFAULT now(),
	"is_online" boolean DEFAULT false,
	"current_mode" text DEFAULT 'single',
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_hacker_name_unique" UNIQUE("hacker_name")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"hacker_name" varchar,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");