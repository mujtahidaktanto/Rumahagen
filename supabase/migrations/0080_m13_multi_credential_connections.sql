-- 0080_m13_multi_credential_connections.sql
-- ADD-NEW — ditemukan saat evaluasi nyata provider Cloudinary untuk BYOK
-- M13 (integrasi upload/edit foto listing): skema agent_ai_connections
-- (0016) hanya punya SATU field kredensial (`encrypted_api_key`), cukup
-- untuk provider model-AI bergaya single-bearer-token (Gemini/OpenAI-style
-- — satu API key mewakili seluruh otorisasi). Cloudinary butuh TIGA
-- kredensial sekaligus: `cloud_name` (identifier akun, TIDAK rahasia —
-- muncul apa adanya di setiap delivery URL publik), `api_key` (dikirim di
-- tiap request, map ke `encrypted_api_key` yang sudah ada), dan
-- `api_secret` (rahasia, dipakai membuat signature SHA-1 — TIDAK ADA
-- tempat menyimpannya di skema lama).
--
-- KEPUTUSAN DESAIN: dua kolom baru bersifat GENERIK (bukan
-- `cloudinary_cloud_name`/`cloudinary_api_secret`) — dipakai ulang provider
-- multi-kredensial mana pun di masa depan, konsisten dengan filosofi M13
-- yang sudah provider-agnostic sejak 0015/0016 (satu skema untuk semua
-- provider, bukan kolom per-provider). Provider single-key (Gemini, dst.)
-- membiarkan kedua kolom ini NULL — tidak ada perubahan perilaku untuk
-- yang sudah ada.
--
-- `public_identifier` TIDAK dienkripsi (plaintext) — secara desain provider
-- (Cloudinary cloud_name) memang bukan rahasia, selalu terlihat di URL hasil
-- transformasi; mengenkripsinya hanya menambah biaya dekripsi tanpa manfaat
-- keamanan. `encrypted_secondary_key` dienkripsi PERSIS seperti
-- `encrypted_api_key` (AES-256-GCM di lapisan aplikasi, lib/crypto/byok.ts)
-- — pola dan mekanisme kripto yang sama dipakai ulang, bukan skema baru.

ALTER TABLE public.agent_ai_connections
  ADD COLUMN IF NOT EXISTS public_identifier       VARCHAR(150),
  ADD COLUMN IF NOT EXISTS encrypted_secondary_key  VARCHAR(500);

COMMENT ON COLUMN public.agent_ai_connections.public_identifier IS
  'ADD-NEW/0080. Identifier akun non-rahasia untuk provider multi-kredensial (mis. Cloudinary cloud_name) — plaintext, boleh ditampilkan balik ke agent tanpa dekripsi. NULL untuk provider single-key (Gemini, dst.).';

COMMENT ON COLUMN public.agent_ai_connections.encrypted_secondary_key IS
  'ADD-NEW/0080. Kredensial rahasia KEDUA untuk provider yang butuh lebih dari satu secret (mis. Cloudinary api_secret, dipakai membuat signature — encrypted_api_key menyimpan api_key Cloudinary). Dienkripsi dengan mekanisme sama persis seperti encrypted_api_key (lib/crypto/byok.ts), TIDAK PERNAH didekripsi di lapisan SQL/RLS. NULL untuk provider single-key.';

-- Tidak ada perubahan RLS — kedua kolom baru tunduk pada policy
-- agent_ai_connections_select/_self_insert/_self_update/_admin_force yang
-- sudah ada (0016), sama seperti encrypted_api_key. Tidak ada perubahan
-- permission baru.
