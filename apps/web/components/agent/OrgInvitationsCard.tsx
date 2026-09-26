"use client";

// components/agent/OrgInvitationsCard.tsx — kartu "Undangan untuk Anda" di Organisasi (M12, wireframe 01-Agent/M12-Organisasi-Dashboard): daftar undangan dari leader dengan Terima / Tolak, keterangan
// masa berlaku, dan keadaan Kedaluwarsa. Terima = PUT /organization-invitations/{id}/accept, Tolak = .../reject (migration 0161: hanya yang diundang, hanya dari pending, belum kedaluwarsa).
// Keadaan: sukses (pesan bergabung lalu halaman dimuat ulang), memproses per baris, gagal (pesan server ditampilkan apa adanya).
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { MyInvitation } from "@/lib/agent/org-data";
import { ORG_TYPE_LABEL, inviteExpiryText } from "@/lib/agent/org-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { initialsOf } from "@/lib/initials";

export function OrgInvitationsCard({ invitations }: { invitations: MyInvitation[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function respond(inv: MyInvitation, action: "accept" | "reject") {
    setBusy(inv.id);
    setError(null);
    setNotice(null);
    try {
      await api.put(`/organization-invitations/${inv.id}/${action}`);
      setNotice(action === "accept" ? `Anda kini anggota "${inv.organizationName}".` : `Undangan dari "${inv.organizationName}" ditolak.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Jawaban belum terkirim. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-labelledby="org-inv-title" className="overflow-hidden rounded-md border border-ink-100 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-4">
        <h2 id="org-inv-title" className="text-title-md">
          Undangan untuk Anda
        </h2>
        <Badge tone="info">{invitations.length} undangan</Badge>
      </div>
      {error ? (
        <p role="alert" className="m-4 mb-0 rounded-md border border-danger-600/30 bg-danger-100 p-3 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="m-4 mb-0 rounded-md border border-success-600/30 bg-success-100 p-3 text-body-md text-success-600">
          {notice}
        </p>
      ) : null}
      <ul>
        {invitations.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center gap-3 border-t border-ink-100 p-4 first:border-t-0">
            <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-100 font-extrabold text-blue-600">
              {initialsOf(v.organizationName).charAt(0)}
            </span>
            <span className="min-w-0 flex-1 basis-56">
              <span className="block truncate text-label-lg">{v.organizationName}</span>
              <span className="block text-caption">
                {ORG_TYPE_LABEL[v.organizationType] ?? v.organizationType} · Diundang {v.leaderName} · {formatDate(v.createdAt)}
              </span>
              {inviteExpiryText(v.expiresAt, v.isExpired, formatDate) ? <span className="block text-caption">{inviteExpiryText(v.expiresAt, v.isExpired, formatDate)}</span> : null}
            </span>
            {v.isExpired ? (
              <Badge tone="neutral" dot={false}>
                Kedaluwarsa
              </Badge>
            ) : (
              <span className="flex flex-none gap-2">
                <Button variant="secondary" size="sm" disabled={busy !== null} onClick={() => void respond(v, "reject")}>
                  Tolak
                </Button>
                <Button size="sm" loading={busy === v.id} disabled={busy !== null} onClick={() => void respond(v, "accept")}>
                  Terima
                </Button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
