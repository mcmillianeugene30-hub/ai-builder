-- Migration: align ai_logs to the generate engine schema
--
-- Target schema:
--   id, user_id, prompt, model_id, provider, success, attempt, latency_ms, created_at
--
-- Changes from current:
--   • Drop  : tokens_used, error, model, response, status
--   • Add   : model_id (text), provider (text), success (boolean), attempt (integer)
--   • Keep  : id, user_id, prompt, latency_ms, created_at (unchanged)

BEGIN;

-- 1. Drop old columns
ALTER TABLE public.ai_logs DROP COLUMN IF EXISTS tokens_used;
ALTER TABLE public.ai_logs DROP COLUMN IF EXISTS error;
ALTER TABLE public.ai_logs DROP COLUMN IF EXISTS response;
ALTER TABLE public.ai_logs DROP COLUMN IF EXISTS status;
ALTER TABLE public.ai_logs DROP COLUMN IF EXISTS model;

-- 2. Add new / renamed columns
ALTER TABLE public.ai_logs ADD COLUMN IF NOT EXISTS model_id    text;
ALTER TABLE public.ai_logs ADD COLUMN IF NOT EXISTS provider    text;
ALTER TABLE public.ai_logs ADD COLUMN IF NOT EXISTS success     boolean;
ALTER TABLE public.ai_logs ADD COLUMN IF NOT EXISTS attempt     integer NOT NULL DEFAULT 1;

-- 3. All existing rows get success = true (they were successful before migration)
UPDATE public.ai_logs SET success = true WHERE success IS NULL;

COMMIT;

-- Verify final shape
DO $$
DECLARE
  col text;
BEGIN
  RAISE NOTICE '=== ai_logs columns after migration ===';
  FOR col IN
    SELECT column_name || ' ' || data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ai_logs'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  %', col;
  END LOOP;
END $$;
