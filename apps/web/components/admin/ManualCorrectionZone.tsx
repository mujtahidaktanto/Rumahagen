"use client";

// components/admin/ManualCorrectionZone.tsx — zona "Manual Correction" (Komersial & Rekonsiliasi, Superadmin-only per permission m14.commercial_administration.manual_correction). TIDAK ADA
// endpoint REST untuk mutasi ini sama sekali (dicek menyeluruh app/api/ — hanya izinnya yang ada di role_permissions, migration 0084, tanpa route pembungkusnya). Daripada menampilkan formulir
// yang kelihatan berfungsi tapi diam-diam gagal, dialog ini murni menjelaskan celahnya — tidak ada aksi submit. Dicatat di audit/FRONTEND_GAPS.md.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

export function ManualCorrectionZone() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 flex items-center justify-between gap-4 rounded-md border border-danger-100 bg-danger-100 p-4">
      <div>
        <span className="text-label-lg text-danger-600">Manual Correction</span>
        <p className="mt-0.5 text-body-md text-ink-700">Mutasi langsung terhadap entitlement/order — TERPISAH dari Review/Escalate biasa (Gate PRE-00-K M09-R09, Superadmin-only).</p>
      </div>
      <Button variant="secondary" size="sm" className="flex-none border-danger-600 text-danger-600" onClick={() => setOpen(true)}>
        Buka Manual Correction
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Manual Correction" footer={<Button onClick={() => setOpen(false)}>Tutup</Button>}>
        <p className="text-body-md text-ink-700">
          Kapabilitas ini punya permission tersendiri (<code>m14.commercial_administration.manual_correction</code>) tapi belum ada endpoint API yang membungkusnya — dicek menyeluruh, tidak
          ditemukan satu pun route untuk mutasi manual entitlement/order. Menampilkan formulir di sini akan terlihat berfungsi padahal diam-diam gagal, jadi belum diimplementasikan. Kasus yang
          butuh koreksi manual saat ini masih ditangani lewat SQL langsung oleh Superadmin.
        </p>
      </Dialog>
    </div>
  );
}
