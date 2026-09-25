"use client";

// components/public/ViewTracker.tsx — mencatat satu tampilan halaman listing (POST /api/listings/{id}/views), sekali per sesi tab per listing; kegagalan diabaikan (analitik
// tidak boleh mengganggu pembaca). Hanya dirender untuk listing yang terbit. Tidak menampilkan apa pun.
import { useEffect } from "react";

export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `ra:view:${listingId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // penyimpanan tidak tersedia: tetap catat sekali per pemuatan
    }
    void fetch(`/api/listings/${listingId}/views`, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
  }, [listingId]);
  return null;
}
