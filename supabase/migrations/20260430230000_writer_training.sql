-- Writer Training: progress + certification tables
-- Tracks per-module quiz scores and overall EDGE certification status for staff writers.

CREATE TABLE IF NOT EXISTS public.writer_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score INTEGER NOT NULL DEFAULT 0,
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_slug)
);

CREATE INDEX IF NOT EXISTS idx_writer_training_progress_user
  ON public.writer_training_progress (user_id);

CREATE TABLE IF NOT EXISTS public.writer_training_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  certified BOOLEAN NOT NULL DEFAULT FALSE,
  overall_score INTEGER NOT NULL DEFAULT 0,
  completed_modules INTEGER NOT NULL DEFAULT 0,
  certified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.writer_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_training_certifications ENABLE ROW LEVEL SECURITY;

-- Users may read and upsert their own progress; admins/editors may read all.
CREATE POLICY "Users read own training progress"
  ON public.writer_training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff read all training progress"
  ON public.writer_training_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users insert own training progress"
  ON public.writer_training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own training progress"
  ON public.writer_training_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own certification"
  ON public.writer_training_certifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff read all certifications"
  ON public.writer_training_certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users insert own certification"
  ON public.writer_training_certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own certification"
  ON public.writer_training_certifications FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.writer_training_progress IS
  'Per-module quiz progress for the EDGE writer training curriculum.';
COMMENT ON TABLE public.writer_training_certifications IS
  'Aggregate EDGE writer certification status — gates Authority Article publishing for authors.';
