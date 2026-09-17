// lib/crypto/byok.ts
// ADD-NEW — infrastruktur enkripsi untuk agent_ai_connections.encrypted_api_key
// (0016_m13_agent_ai_connections.sql). Komentar migration eksplisit bilang:
// "encrypted_api_key TIDAK PERNAH didekripsi di lapisan SQL/RLS — hanya
// disimpan; dekripsi terjadi di application layer route handler saat dipakai
// memanggil provider." — util inilah lapisan aplikasi yang dimaksud. Tidak
// ada pola enkripsi lain di repo ini sebelum modul M13, jadi didesain baru
// mengikuti standar umum (AES-256-GCM, bukan skema custom) — bukan diam-diam
// menyimpan API key mentah.
//
// Key sumber: env var BYOK_ENCRYPTION_KEY (32 byte, base64) — WAJIB diisi di
// .env.local sebelum endpoint create/rotate connection dipakai. TIDAK ada
// default/fallback key tertanam di kode (itu akan membuat enkripsi tidak
// berguna) — kalau env var tidak ada, fungsi ini sengaja throw, bukan diam
// memakai key lemah.

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const raw = process.env.BYOK_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "BYOK_ENCRYPTION_KEY belum diisi di .env.local — wajib untuk menyimpan/membaca BYOK API key. " +
        "Generate dengan: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("BYOK_ENCRYPTION_KEY harus 32 byte setelah di-decode base64 (AES-256).");
  }
  return key;
}

// Format tersimpan: base64(iv) + "." + base64(authTag) + "." + base64(ciphertext)
// — muat jauh di bawah batas VARCHAR(500) untuk API key sepanjang apa pun yang wajar.
export function encryptApiKey(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}.${authTag.toString("base64")}.${ciphertext.toString("base64")}`;
}

export function decryptApiKey(stored: string): string {
  const key = getKey();
  const [ivB64, authTagB64, ciphertextB64] = stored.split(".");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error("Format encrypted_api_key tidak valid (bukan hasil encryptApiKey()).");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
