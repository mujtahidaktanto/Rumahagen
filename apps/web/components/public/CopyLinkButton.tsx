"use client";

// components/public/CopyLinkButton.tsx — "Salin tautan halaman ini": menyalin URL halaman ke papan klip dan memberi tahu "Tautan disalin" (wireframe M04 Verifikasi Sertifikat).
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyLinkButton({ label = "Salin tautan halaman ini" }: { label?: string }) {
  const [note, setNote] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNote("Tautan disalin");
    } catch {
      setNote("Tautan tidak dapat disalin");
    }
    setTimeout(() => setNote(null), 2500);
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button variant="secondary" size="sm" onClick={copy}>
        {label}
      </Button>
      <span role="status" aria-live="polite" className="min-h-4 text-caption text-ink-500">
        {note}
      </span>
    </span>
  );
}
