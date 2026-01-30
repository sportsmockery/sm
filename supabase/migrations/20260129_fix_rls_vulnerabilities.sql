-- =====================================================
-- FIX RLS VULNERABILITIES
-- Date: 2026-01-29
-- Issue: Overly permissive policies using USING (true)
-- =====================================================

-- VULNERABILITY 1: sm_user_preferences
-- The "Service role full access" policy with USING (true) allows ANY user
-- to read/write/delete ALL user preferences, not just their own.
-- Service role already bypasses RLS, so this policy is unnecessary.

DROP POLICY IF EXISTS "Service role full access" ON sm_user_preferences;

-- VULNERABILITY 2: subscriptions
-- The "Service role can manage subscriptions" policy with USING (true)
-- allows ANY user to manage ALL subscriptions.
-- Service role already bypasses RLS, so this policy is unnecessary.

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

-- =====================================================
-- VERIFICATION: Check that proper policies still exist
-- =====================================================

-- sm_user_preferences should still have these user-scoped policies:
-- - "Users can read own preferences" (SELECT where auth.uid() = user_id)
-- - "Users can insert own preferences" (INSERT where auth.uid() = user_id)
-- - "Users can update own preferences" (UPDATE where auth.uid() = user_id)

-- subscriptions should still have user-scoped policies:
-- - "Users can read own subscription" (SELECT where auth.uid() = user_id)

-- List remaining policies for verification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('sm_user_preferences', 'subscriptions')
ORDER BY tablename, policyname;
