"use client";

// components/agent/CertificateList.tsx — kartu "Sertifikat Saya" (M04 Pembelajaran): tiap kursus selesai berstatus Terbit / Belum diterbitkan / Dicabut. Aksi: unduh PDF
// (terbit -> /api/certificates/{id}/pdf; belum terbit -> /api/courses/{id}/certificate yang menerbitkan saat itu juga) dan salin tautan verifikasi publik /verifikasi/{kode}.
// Pesan berhasil/gagal tampil di atas daftar (role=status / role=alert).
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { downloadCertificatePdf } from "@/lib/agent/certificate-download";
import type { MyCertificate } from "@/lib/agent/learning-data";
import { CERT_LABEL, CERT_TONE } from "@/lib/agent/learning-rules";
import { formatDate } from "@/lib/format";

export function CertificateList({ items }: { items: MyCertificate[] | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function download(c: MyCertificate) {
    setBusy(c.courseId);
    setMsg(null);
    try {
      await downloadCertificatePdf(c.id ? `/api/certificates/${c.id}/pdf?download=1` : `/api/courses/${c.courseId}/certificate?download=1`, "sertifikat.pdf");
      setMsg({ kind: "ok", text: `Sertifikat “${c.title}” diunduh.` });
      if (!c.id) router.refresh(); // baru diterbitkan: muat ulang agar nomor dan tombol salin muncul
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Sertifikat belum bisa diunduh." });
    } finally {
      setBusy(null);
    }
  }

  async function copy(c: MyCertificate) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/verifikasi/${c.verificationCode}`);
      setMsg({ kind: "ok", text: "Tautan verifikasi disalin." });
    } catch {
      setMsg({ kind: "err", text: "Tautan tidak dapat disalin. Coba lagi atau salin dari halaman verifikasi." });
    }
  }

  if (!items) return <ErrorState title="Sertifikat gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />;
  if (items.length === 0) return <EmptyState title="Belum ada kursus selesai" message="Selesaikan kursus dan lulus semua kuisnya untuk mendapat sertifikat." />;

  return (
    <div>
      {msg ? (
        <div role={msg.kind === "ok" ? "status" : "alert"} className={`mb-2 flex items-center gap-3 rounded-md p-3 text-body-md ${msg.kind === "ok" ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600"}`}>
          <span className="min-w-0 flex-1">{msg.text}</span>
          <Button variant="secondary" size="sm" onClick={() => setMsg(null)}>
            Tutup
          </Button>
        </div>
      ) : null}
      <ul>
        {items.map((c) => (
          <li key={c.courseId} className="flex flex-col gap-3 border-t border-ink-100 py-3.5 first:border-t-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1 text-label-lg break-words">{c.title}</span>
                <Badge tone={CERT_TONE[c.status]} className="flex-none">
                  {CERT_LABEL[c.status]}
                </Badge>
              </div>
              {c.status === "issued" ? (
                <span className="text-caption">
                  Lulus {formatDate(c.passedAt)} · Nomor {c.number}
                </span>
              ) : null}
              {c.status === "missing" ? <span className="text-caption">Lulus {formatDate(c.passedAt)} · Sertifikat diterbitkan saat Anda mengunduhnya.</span> : null}
              {c.status === "revoked" ? <span className="text-caption text-danger-600">Dicabut {formatDate(c.revokedAt)}. Hubungi admin bila ada kekeliruan.</span> : null}
            </div>
            {c.status !== "revoked" ? (
              <div className="flex flex-none flex-wrap gap-2">
                {c.status === "issued" ? (
                  <Button variant="secondary" size="sm" onClick={() => void copy(c)}>
                    Salin tautan verifikasi
                  </Button>
                ) : null}
                <Button size="sm" loading={busy === c.courseId} disabled={busy !== null} onClick={() => void download(c)}>
                  {busy === c.courseId ? (c.id ? "Menyiapkan…" : "Menerbitkan…") : c.id ? "Unduh PDF" : "Terbitkan & Unduh"}
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="border-t border-ink-100 pt-3 text-caption">Sertifikat bisa diunduh ulang kapan saja. Bagikan tautan verifikasi ke calon klien agar keasliannya bisa dicek tanpa login.</p>
    </div>
  );
}
