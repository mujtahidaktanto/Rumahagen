// app/verifikasi/ui.tsx
// Potongan tampilan bersama untuk halaman publik verifikasi sertifikat. Gaya inline sengaja sederhana: aplikasi ini belum punya sistem desain UI
// (layout root hanya scaffold); ganti dengan komponen sistem desain saat UI dibangun.

import type { CSSProperties, ReactNode } from "react";

export const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #DDE3EA",
  borderRadius: 12,
  padding: 20,
};

const OrganizerLabels: Record<string, string> = { rumahagen: "RumahAgen", partner: "Mitra RumahAgen", instructor: "Instruktur" };

export function organizerLabel(type: string | null): string | null {
  return type ? OrganizerLabels[type] ?? null : null;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(d);
}

export function VerifyShell({ children }: { children: ReactNode }) {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 48px", display: "grid", gap: 16, fontFamily: "system-ui, sans-serif", color: "#14202E" }}>
      <header>
        <div style={{ fontWeight: 800, fontSize: 18 }}>RumahAgen</div>
        <div style={{ color: "#5B6B7F", fontSize: 14 }}>Verifikasi Sertifikat</div>
      </header>
      {children}
    </main>
  );
}

// Formulir GET biasa (tanpa JavaScript): /verifikasi?kode=XXXX-XXXX-XXXX mengalihkan ke /verifikasi/{kode}.
export function VerifyForm({ label = "Periksa", defaultValue = "" }: { label?: string; defaultValue?: string }) {
  return (
    <form action="/verifikasi" method="get" style={{ ...cardStyle, display: "grid", gap: 10 }}>
      <label htmlFor="kode" style={{ fontWeight: 600 }}>Kode verifikasi</label>
      <input
        id="kode"
        name="kode"
        defaultValue={defaultValue}
        placeholder="XXXX-XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        required
        style={{ minHeight: 44, padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, monospace", border: "1px solid #B8C2CF", borderRadius: 8 }}
      />
      <button type="submit" style={{ minHeight: 44, border: 0, borderRadius: 8, background: "#1F5FBF", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        {label}
      </button>
    </form>
  );
}
