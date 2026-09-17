-- 0078_performance_indexes_fk_phase4.sql
-- ADD-NEW — penutup Fase 4 (0071-0077), pola dan alasan PERSIS sama
-- seperti 0038/0053/0063/0070: index B-tree untuk kolom FK yang akan
-- ditandai "Unindexed foreign keys" oleh Supabase Performance Advisor.

CREATE INDEX IF NOT EXISTS idx_addons_promotion_id ON public.addons (promotion_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON public.subscriptions (organization_id);

CREATE INDEX IF NOT EXISTS idx_commercial_orders_user_id ON public.commercial_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_organization_id ON public.commercial_orders (organization_id);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_subscription_id ON public.commercial_orders (subscription_id);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_addon_id ON public.commercial_orders (addon_id);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_promotion_id ON public.commercial_orders (promotion_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_commercial_order_id ON public.payment_transactions (commercial_order_id);

CREATE INDEX IF NOT EXISTS idx_payment_provider_results_payment_transaction_id ON public.payment_provider_results (payment_transaction_id);

CREATE INDEX IF NOT EXISTS idx_commercial_fulfillments_payment_transaction_id ON public.commercial_fulfillments (payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_commercial_fulfillments_commercial_order_id ON public.commercial_fulfillments (commercial_order_id);

CREATE INDEX IF NOT EXISTS idx_reconciliation_cases_payment_transaction_id ON public.reconciliation_cases (payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_cases_commercial_order_id ON public.reconciliation_cases (commercial_order_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_cases_fulfillment_id ON public.reconciliation_cases (fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_cases_entitlement_id ON public.reconciliation_cases (entitlement_id);

CREATE INDEX IF NOT EXISTS idx_commercial_entitlements_source_order_id ON public.commercial_entitlements (source_order_id);
CREATE INDEX IF NOT EXISTS idx_commercial_entitlements_source_payment_transaction_id ON public.commercial_entitlements (source_payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_commercial_entitlements_source_fulfillment_id ON public.commercial_entitlements (source_fulfillment_id);
