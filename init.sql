-- scripts/init.sql (Corrected Version)

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the database user (rogueuser) if it doesn't already exist
-- IMPORTANT: Replace 'your_actual_db_password_here' with the actual password from your .env or docker-compose.yml
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rogueuser') THEN
      CREATE ROLE rogueuser WITH LOGIN PASSWORD 'nZrdLEehQFVTZ9ogVZXxmfpKOe68thkQTtwuVXaokQM='; -- <--- THIS IS THE CRITICAL LINE!
   END IF;
END
$do$;

-- Grant necessary privileges to the created user on the database
-- The database 'roguesim' is created automatically by POSTGRES_DB env var.
GRANT ALL PRIVILEGES ON DATABASE roguesim TO rogueuser; -- <--- Changed from roguesim_user to rogueuser

-- Set timezone
SET timezone = 'UTC';

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status TEXT DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO health_check (status) VALUES ('Database initialized successfully');
