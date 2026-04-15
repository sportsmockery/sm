-- =====================================================
-- ENABLE RLS ON ALL REMAINING SM TABLES
-- Date: 2026-04-15
-- Tables: 9 tables that were missing RLS
-- =====================================================

-- 1. chat_notifications — user-scoped
ALTER TABLE IF EXISTS public.chat_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.chat_notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.chat_notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.chat_notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- 2. chat_room_participants — authenticated read, self-manage
ALTER TABLE IF EXISTS public.chat_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read room participants"
  ON public.chat_room_participants FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own participation"
  ON public.chat_room_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON public.chat_room_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3. image_optimizations — service role only (no policies)
ALTER TABLE IF EXISTS public.image_optimizations ENABLE ROW LEVEL SECURITY;

-- 4. sm_media — public read
ALTER TABLE IF EXISTS public.sm_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read media"
  ON public.sm_media FOR SELECT TO anon, authenticated
  USING (true);

-- 5. sm_post_tags — public read
ALTER TABLE IF EXISTS public.sm_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read post tags"
  ON public.sm_post_tags FOR SELECT TO anon, authenticated
  USING (true);

-- 6. sm_tags — public read
ALTER TABLE IF EXISTS public.sm_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tags"
  ON public.sm_tags FOR SELECT TO anon, authenticated
  USING (true);

-- 7-9. writer_payment_* — SENSITIVE, service role only (no policies)
ALTER TABLE IF EXISTS public.writer_payment_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.writer_payment_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.writer_payments ENABLE ROW LEVEL SECURITY;
