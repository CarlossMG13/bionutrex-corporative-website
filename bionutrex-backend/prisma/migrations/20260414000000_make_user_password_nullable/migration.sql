-- Make password nullable on users table
-- Auth is handled by Supabase Auth; password field is no longer used

ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
