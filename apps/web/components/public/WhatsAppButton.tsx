"use client";

// components/public/WhatsAppButton.tsx — "Chat via WhatsApp" (wireframe M11 kartu agen): mencatat klik (POST /api/listings/{id}/cta-click, tanpa menunggu hasil) lalu membuka wa.me
// di tab baru. Tautan tetap berupa <a href> sungguhan (bisa dibuka tanpa JS, klik tengah, salin alamat); pencatatan hanya tambahan.
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function WhatsAppButton({ listingId, href, className }: { listingId: string; href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        void fetch(`/api/listings/${listingId}/cta-click`, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
      }}
      className={cn(buttonClass("primary", "md"), "hover:text-white hover:no-underline", className)}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.5-.7L3 21l1.8-5.4A8.4 8.4 0 1 1 21 11.5Z" />
      </svg>
      Chat via WhatsApp
    </a>
  );
}
