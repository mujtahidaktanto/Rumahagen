"use client";

// components/agent/EventRegistrants.tsx — kartu "Pendaftar" di Kelola Event (penyelenggara): ringkasan per status, daftar pendaftar, dan aksi Setujui / Tolak / Tandai Hadir / Batalkan lewat
// PATCH /api/events/{id}/registrations/{rid} (Idempotency-Key). Tolak dan Batalkan meminta konfirmasi karena peserta ikut diberi tahu. Empat keadaan: kosong, gagal, sukses, memproses per baris.
// Aturan transisi ditegakkan trigger (migration 0160); pesan galat server ditampilkan apa adanya.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import type { Registrant } from "@/lib/agent/event-data";
import { REGISTRATION_LABEL, REGISTRATION_TONE, countRegistrants, registrantActions, type RegistrantAction } from "@/lib/agent/event-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

type Props = { eventId: string; registrants: Part<Registrant[]>; startIso: string; quota: number | null; approvalMode: string };

export function EventRegistrants({ eventId, registrants, startIso, quota, approvalMode }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ r: Registrant; a: RegistrantAction } | null>(null);
  const started = Date.parse(startIso) <= Date.now();

  async function run(r: Registrant, a: RegistrantAction) {
    setBusy(r.id);
    setError(null);
    try {
      await api.patch(`/events/${eventId}/registrations/${r.id}`, { status: a.to }, { idempotency: true });
      setConfirm(null);
      router.refresh();
    } catch (e) {
      setConfirm(null);
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  const list = registrants.ok ? registrants.data : [];
  const c = countRegistrants(list);

  return (
    <section aria-labelledby="ev-reg-title" className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ev-reg-title" className="text-title-md">
          Pendaftar
        </h2>
        {registrants.ok ? (
          <span className="text-caption">
            {c.registered + c.attended} terdaftar{quota ? ` dari kuota ${quota} (informasi)` : ""}
            {c.pending > 0 ? ` · ${c.pending} menunggu` : ""}
          </span>
        ) : null}
      </div>
      {approvalMode === "closed" ? <p className="text-caption">Pendaftaran baru sedang ditutup. Pendaftar yang sudah ada tetap bisa diatur di sini.</p> : null}
      {error ? (
        <p role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      {!registrants.ok ? (
        <ErrorState title="Pendaftar gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : list.length === 0 ? (
        <EmptyState title="Belum ada pendaftar" message="Pendaftar akan muncul di sini setelah event tayang dan Agent mendaftar." />
      ) : (
        <ul>
          {list.map((r) => {
            const actions = registrantActions(r.status, started);
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-3 border-b border-ink-50 py-3 last:border-b-0">
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block truncate text-body-md">{r.agentName}</span>
                  <span className="text-caption">
                    {r.participantMode === "guest" && r.guestEmail ? `Tamu: ${r.guestEmail} · ` : r.agentOffice ? `${r.agentOffice} · ` : ""}
                    Daftar {formatDateTime(r.registeredAt)}
                  </span>
                </span>
                <Badge tone={REGISTRATION_TONE[r.status] ?? "neutral"} className="flex-none">
                  {REGISTRATION_LABEL[r.status] ?? r.status}
                </Badge>
                {actions.length > 0 ? (
                  <span className="flex flex-none gap-2">
                    {actions.map((a) => (
                      <Button
                        key={a.to}
                        size="sm"
                        variant={a.danger ? "ghost" : "secondary"}
                        className={a.danger ? "text-danger-600" : undefined}
                        loading={busy === r.id}
                        disabled={busy !== null}
                        onClick={() => (a.confirm ? setConfirm({ r, a }) : void run(r, a))}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={confirm !== null}
        onClose={() => (busy ? undefined : setConfirm(null))}
        title={confirm?.a.label === "Tolak" ? "Tolak pendaftaran?" : "Batalkan pendaftaran?"}
        description={confirm ? `Pendaftaran ${confirm.r.agentName} akan dibatalkan dan peserta diberi tahu. Peserta bisa mendaftar lagi selama pendaftaran masih dibuka.` : undefined}
        footer={
          <>
            <Button variant="secondary" disabled={busy !== null} onClick={() => setConfirm(null)}>
              Kembali
            </Button>
            <Button variant="danger" loading={busy !== null} onClick={() => confirm && void run(confirm.r, confirm.a)}>
              {confirm?.a.label ?? "Ya"}
            </Button>
          </>
        }
      />
    </section>
  );
}
