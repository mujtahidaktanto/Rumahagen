## CONTROLLED SYNCHRONIZATION NOTICE — STEP 07
**Date:** 16 August 2026  
**AEP source:** AEP #4 Learning Session  
**Cross-AEP dependencies:** Step 05 D1 Commercial/Payment PASS; Step 06 D2 Learning Economy PASS WITH CONTROLLED RESIDUAL  
**Scope:** D3 Learning Session downstream semantic synchronization only.

This is a controlled semantic overlay. It preserves the AEP4 final decision state and does not authorize physical migration, final provider production binding, final RBAC permission IDs, automatic provider failover, or closure of MADCR-049/053/054.

# D3 Provider Adapter / Integration Contract — Semantic Baseline

## 1. Adapter boundary
`Learning Session ↔ Session Orchestrator ↔ Provider Adapter ↔ External Provider`

Provider-specific APIs, credentials, tokens, event formats and external session IDs remain behind the adapter boundary.

## 2. Normalized evidence pipeline
`Provider event → validation → normalization → idempotency → correlation → Participation Evidence`.

Provider event must never directly set Attendance, Completion, Learning Activity, LP, Credential or Awarding outcome.

## 3. Provider switching
An authorized provider replacement changes Provider Binding, not the semantic Learning Session identity. Existing enrollment, valid evidence and outcome history remain attached to the same semantic session.

Automatic provider failover is **not** mandatory; AEP4-OD-08 remains OPEN/DEFERRED pending provider capability and technical/operational verification.

## 4. Provider set
Architecture remains provider-agnostic. Exact supported provider production binding requires independent verification of API/OAuth/events/quotas/plans/rate limits/pricing/policy.

## 5. Recording
Recording is an optional session artifact/reference and may support ON_DEMAND. Retention, privacy, replay, transcript and DRM remain downstream media/operational policy.

## 6. Contract hold
Exact provider payloads, webhook/event names, OAuth scopes, retry/backoff, rate limits and credential storage are downstream/provider-verification work.
