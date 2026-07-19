-- ============================================================
-- Migration 002: Enable RLS on all tables + fix RPC security
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE account ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategory ENABLE ROW LEVEL SECURITY;
ALTER TABLE trans ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budgetCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt ENABLE ROW LEVEL SECURITY;
ALTER TABLE "debtTrans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE "goalTrans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE template ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency ENABLE ROW LEVEL SECURITY;

-- 2. Create permissive policies for service_role (bypass RLS)
--    Since only service_role key is used, these policies ensure
--    service_role can still do everything while anon/authenticated
--    are blocked (no policy for them = no access).

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['account','wallet','category','subcategory','trans','media','budget','budgetCategory','user_budget','debt','debtTrans','goal','goalTrans','recurring','template','currency'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    EXECUTE format('CREATE POLICY "service_role_all" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END;
$$;

-- 3. Fix RPC: set search_path, revoke execute from public roles
CREATE OR REPLACE FUNCTION update_wallet_balance(wallet_id BIGINT, delta INTEGER)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE wallet SET amount = amount + delta WHERE id = wallet_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_wallet_balance FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_wallet_balance TO service_role;
