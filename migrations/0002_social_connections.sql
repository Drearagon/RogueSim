CREATE TABLE IF NOT EXISTS "user_friends" (
    "id" serial PRIMARY KEY,
    "requester_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "addressee_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "status" text NOT NULL DEFAULT 'pending',
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "responded_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_friends_unique_pair"
    ON "user_friends" ("requester_id", "addressee_id");

CREATE TABLE IF NOT EXISTS "user_blocks" (
    "id" serial PRIMARY KEY,
    "blocker_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "blocked_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_blocks_unique_pair"
    ON "user_blocks" ("blocker_id", "blocked_id");
