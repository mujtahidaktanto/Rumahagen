// lib/config.ts — nilai konfigurasi publik yang dipakai UI.

/**
 * Email dukungan (tombol "Hubungi Dukungan" di Akun Dibatasi). SEMENTARA memakai email Google pemilik produk (keputusan 2026-09-26) sampai email resmi
 * rumahagen.com tersedia; ganti dengan menetapkan env NEXT_PUBLIC_SUPPORT_EMAIL (tanpa mengubah kode).
 */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "mujtahidaktanto@gmail.com";
