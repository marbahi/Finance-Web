-- ============================================================
-- Migration 003: Fix PostgreSQL sequences after data migration
-- Run this in Supabase SQL Editor
-- ============================================================

SELECT setval('account_id_seq',      COALESCE((SELECT MAX(id) FROM account), 1));
SELECT setval('wallet_id_seq',       COALESCE((SELECT MAX(id) FROM wallet), 1));
SELECT setval('category_id_seq',     COALESCE((SELECT MAX(id) FROM category), 1));
SELECT setval('subcategory_id_seq',  COALESCE((SELECT MAX(id) FROM subcategory), 1));
SELECT setval('trans_id_seq',        COALESCE((SELECT MAX(id) FROM trans), 1));
SELECT setval('budget_id_seq',       COALESCE((SELECT MAX(id) FROM budget), 1));
SELECT setval('budgetCategory_id_seq', COALESCE((SELECT MAX(id) FROM "budgetCategory"), 1));
SELECT setval('user_budget_id_seq',  COALESCE((SELECT MAX(id) FROM user_budget), 1));
SELECT setval('debt_id_seq',         COALESCE((SELECT MAX(id) FROM debt), 1));
SELECT setval('debtTrans_id_seq',    COALESCE((SELECT MAX(id) FROM "debtTrans"), 1));
SELECT setval('goal_id_seq',         COALESCE((SELECT MAX(id) FROM goal), 1));
SELECT setval('goalTrans_id_seq',    COALESCE((SELECT MAX(id) FROM "goalTrans"), 1));
SELECT setval('recurring_id_seq',    COALESCE((SELECT MAX(id) FROM recurring), 1));
SELECT setval('template_id_seq',     COALESCE((SELECT MAX(id) FROM template), 1));
SELECT setval('currency_id_seq',     COALESCE((SELECT MAX(id) FROM currency), 1));
