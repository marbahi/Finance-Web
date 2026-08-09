-- ============================================================
-- Migration 003: Fix half-applied transfers + balance integrity
-- Paste & run ini di Supabase SQL Editor (untuk data real)
-- ============================================================

-- 1. Perbaiki transaksi transfer yang tercatat tanpa dompet tujuan
--    (waktu itu destination lookup gagal -> transfer_wallet_id = -1)
UPDATE trans SET transfer_wallet_id = 2 WHERE id = 349 AND transfer_wallet_id = -1;

-- 2. Kreditan yang hilang dikembalikan ke dompet tujuan (Bibit = id 2)
--    Delta = amount transaksi 349 (5.000.000 sen = Rp 50.000 /x100)
DO $$
DECLARE v BIGINT := (SELECT amount FROM trans WHERE id = 349 AND type = 2);
BEGIN
  IF v IS NOT NULL THEN
    UPDATE wallet SET amount = amount + v WHERE id = 2;
  END IF;
END;
$$;

-- 3. VERIFIKASI: pastikan sekarang pengaruh transaksi 349 tercermin
SELECT id, note, type, amount FROM trans WHERE id IN (349, 350);
SELECT id, name, amount FROM wallet WHERE id IN (2, 4);

-- 4. OPSIONAL — rekonstruksi penuh saldo semua dompet dari transaksi.
--    HATI-HATI: menimpa kolom wallet.amount semua dompet (buat backup dulu).
--    Jalankan hanya jika kamu yakin data transaksi sudah benar.
-- CREATE OR REPLACE FUNCTION recalc_balances() RETURNS void LANGUAGE plpgsql AS $$
-- BEGIN
--   WITH legs AS (
--     SELECT wallet_id AS wid, -amount AS leg FROM trans WHERE type = 2
--     UNION ALL
--     SELECT transfer_wallet_id, amount FROM trans WHERE type = 2 AND transfer_wallet_id <> -1
--     UNION ALL
--     SELECT wallet_id, amount FROM trans WHERE type IN (0, 1)
--   )
--   UPDATE wallet w SET amount = w.initial_amount + COALESCE(l.total, 0)
--   FROM (SELECT wid, SUM(leg) total FROM legs GROUP BY wid) l
--   WHERE l.wid = w.id;
-- $$;
-- SELECT recalc_balances();