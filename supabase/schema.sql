-- ============================================================
-- El Gran Checkout — Schema de Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla principal de pagos
CREATE TABLE IF NOT EXISTS payments (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT        UNIQUE,                         -- ID de transacción exitosa (txn_XXXXXXXX)
  merchant_id    TEXT        NOT NULL,
  merchant_name  TEXT        NOT NULL,
  amount         NUMERIC(10, 2) NOT NULL,
  currency       TEXT        NOT NULL DEFAULT 'MXN',
  description    TEXT,
  reference      TEXT,
  status         TEXT        NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_code     TEXT,                                       -- INSUFFICIENT_FUNDS, CARD_DECLINED, etc.
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tokens de notificaciones push
CREATE TABLE IF NOT EXISTS push_tokens (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  token      TEXT        UNIQUE NOT NULL,                    -- Expo Push Token
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_merchant   ON payments (merchant_id);

-- ── Row Level Security ────────────────────────────────────────
-- La app usa la clave anon; estas políticas permiten insertar y leer.
ALTER TABLE payments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- payments: la app puede insertar y leer sus propios registros
CREATE POLICY "Insertar pagos"  ON payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Leer pagos"      ON payments FOR SELECT TO anon USING (true);

-- push_tokens: upsert (insert + update) para registrar/actualizar el token
CREATE POLICY "Upsert push tokens" ON push_tokens FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- ── Vista útil para el dashboard (opcional) ───────────────────
CREATE OR REPLACE VIEW payments_summary AS
SELECT
  DATE_TRUNC('day', created_at)   AS day,
  COUNT(*)                        AS total,
  COUNT(*) FILTER (WHERE status = 'success') AS successful,
  COUNT(*) FILTER (WHERE status = 'failed')  AS failed,
  SUM(amount) FILTER (WHERE status = 'success') AS total_amount,
  currency
FROM payments
GROUP BY 1, currency
ORDER BY 1 DESC;
