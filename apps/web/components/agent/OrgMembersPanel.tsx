"use client";

// components/agent/OrgMembersPanel.tsx — isi "Kelola Anggota" (M12, wireframe 01-Agent/M12-Kelola-Anggota): Permintaan Bergabung (Terima/Tolak), Undangan Terkirim (Batalkan), Anggota Aktif (Keluarkan dengan
// konfirmasi, hanya leader), dan dialog "Undang Anggota" (cari nama/nomor lisensi, undangan berlaku 7 hari). Semua lewat /api dengan Idempotency-Key; aturan siapa boleh apa ditegakkan trigger 0161 dan
// pesan galat server ditampilkan apa adanya. Anggota biasa hanya melihat daftar anggota aktif.
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Field";
import { EmptyState, ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import type { PendingRequest, RosterMember } from "@/lib/agent/org-data";
import { ROLE_LABEL, ROLE_TONE, canInviteMembers, canRemoveMember } from "@/lib/agent/org-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { initialsOf } from "@/lib/initials";
import { relativeTimeId } from "@/lib/agent/time";

type Props = { orgId: string; orgName: string; role: string; status: string; roster: Part<RosterMember[]>; pending: Part<PendingRequest[]> | null };
type Found = { agent_id: string; agent_name: string; agent_area: string | null; agent_office: string | null };

const INVITE_DAYS = 7;

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-title-md">{title}</h2>
        {note ? <span className="text-caption">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Avatar({ name, tone = "blue" }: { name: string; tone?: "blue" | "ink" }) {
  return (
    <span aria-hidden="true" className={`flex h-10 w-10 flex-none items-center justify-center rounded-full font-bold ${tone === "blue" ? "bg-blue-100 text-blue-600" : "bg-ink-100 text-ink-500"}`}>
      {initialsOf(name)}
    </span>
  );
}

export function OrgMembersPanel({ orgId, orgName, role, status, roster, pending }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [remove, setRemove] = useState<RosterMember | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Found[] | "loading" | "error">([]);

  const isLeader = role === "leader";
  const canInvite = canInviteMembers(role, status);
  const list = roster.ok ? roster.data : [];
  const pend = pending && pending.ok ? pending.data : [];
  const requests = pend.filter((p) => p.kind === "agent_request" && !p.isExpired);
  const sent = pend.filter((p) => p.kind === "leader_invite");

  const msg = (e: unknown, fallback: string) => (e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : fallback);
  const netFail = "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.";

  async function act(key: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(ok);
      router.refresh();
    } catch (e) {
      setError(msg(e, netFail));
    } finally {
      setBusy(null);
    }
  }

  // Pencarian Agent untuk diundang (jeda 350 ms setelah berhenti mengetik, minimal 2 huruf).
  useEffect(() => {
    if (!inviteOpen) return;
    const term = q.trim();
    if (term.length < 2) {
      setFound([]);
      return;
    }
    setFound("loading");
    let alive = true;
    const t = setTimeout(() => {
      api
        .get<Found[]>(`/organizations/${orgId}/invitable-agents`, { q: term })
        .then((r) => alive && setFound(r.data))
        .catch(() => alive && setFound("error"));
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, inviteOpen, orgId]);

  async function invite(a: Found) {
    setBusy(`inv-${a.agent_id}`);
    setError(null);
    try {
      await api.post(`/organizations/${orgId}/invitations`, { agent_id: a.agent_id, expires_at: new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString() }, { idempotency: true });
      setFound((cur) => (Array.isArray(cur) ? cur.filter((x) => x.agent_id !== a.agent_id) : cur));
      setNotice(`Undangan untuk ${a.agent_name} terkirim.`);
      router.refresh();
    } catch (e) {
      setError(msg(e, "Undangan belum terkirim. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Jejak halaman" className="flex items-center gap-2 text-title-md">
          <Link href={"/agent/organisasi" as Route} className="text-blue-600">
            Organisasi
          </Link>
          <span aria-hidden="true">/</span>
          <h1 className="text-title-md">Kelola Anggota</h1>
        </nav>
        {canInvite ? (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            + Undang Anggota
          </Button>
        ) : null}
      </div>
      <p className="-mt-3 text-caption">{orgName}</p>

      {error ? (
        <p role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3.5 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-md border border-success-600/30 bg-success-100 p-3.5 text-body-md text-success-600">
          {notice}
        </p>
      ) : null}

      {isLeader ? (
        <>
          {pending && !pending.ok ? (
            <ErrorState title="Permintaan dan undangan gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              {requests.length > 0 ? (
                <Section title={`Permintaan Bergabung (${requests.length})`} note="Agen yang mengajukan diri">
                  <ul>
                    {requests.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center gap-3 border-b border-ink-50 py-3 last:border-b-0">
                        <Avatar name={r.agentName} />
                        <span className="min-w-0 flex-1 basis-48">
                          <span className="block truncate text-label-lg">{r.agentName}</span>
                          <span className="text-caption">
                            {r.agentOffice ? `${r.agentOffice} · ` : ""}Mengajukan {relativeTimeId(r.createdAt)}
                          </span>
                        </span>
                        <span className="flex flex-none gap-2">
                          <Button variant="secondary" size="sm" disabled={busy !== null || !canInvite} onClick={() => void act(`rej-${r.id}`, () => api.put(`/organization-invitations/${r.id}/reject`), `Permohonan ${r.agentName} ditolak.`)}>
                            Tolak
                          </Button>
                          <Button size="sm" loading={busy === `acc-${r.id}`} disabled={busy !== null || !canInvite} onClick={() => void act(`acc-${r.id}`, () => api.put(`/organization-invitations/${r.id}/accept`), `${r.agentName} kini anggota organisasi.`)}>
                            Terima
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <Section title="Undangan Terkirim" note="Menunggu respons agen">
                {sent.length === 0 ? (
                  <p className="py-4 text-center text-body-md text-ink-500">Belum ada undangan terkirim.</p>
                ) : (
                  <ul>
                    {sent.map((i) => (
                      <li key={i.id} className="flex flex-wrap items-center gap-3 border-b border-ink-50 py-3 last:border-b-0">
                        <Avatar name={i.agentName} tone="ink" />
                        <span className="min-w-0 flex-1 basis-48">
                          <span className="block truncate text-label-lg">{i.agentName}</span>
                          <span className="text-caption">
                            Dikirim {relativeTimeId(i.createdAt)}
                            {i.expiresAt ? (i.isExpired ? " · Kedaluwarsa" : ` · Berlaku sampai ${formatDate(i.expiresAt)}`) : ""}
                          </span>
                        </span>
                        <Badge tone={i.isExpired ? "neutral" : "warning"}>{i.isExpired ? "Kedaluwarsa" : "Pending"}</Badge>
                        <Button variant="secondary" size="sm" loading={busy === `can-${i.id}`} disabled={busy !== null} onClick={() => void act(`can-${i.id}`, () => api.put(`/organization-invitations/${i.id}/cancel`), `Undangan untuk ${i.agentName} dibatalkan.`)}>
                          Batalkan
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </>
          )}
        </>
      ) : null}

      <Section title={`Anggota Aktif (${list.length})`}>
        {!roster.ok ? (
          <ErrorState title="Anggota gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : list.length === 0 ? (
          <EmptyState title="Belum ada anggota" />
        ) : (
          <ul>
            {list.map((m) => (
              <li key={m.memberId} className="flex flex-wrap items-center gap-3 border-b border-ink-50 py-3 last:border-b-0">
                <Avatar name={m.name} />
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block truncate text-label-lg">
                    {m.name}
                    {m.isSelf ? <span className="ml-1.5 text-caption font-normal">(Anda)</span> : null}
                  </span>
                  <span className="text-caption">Bergabung {relativeTimeId(m.joinedAt)}</span>
                </span>
                <Badge tone={ROLE_TONE[m.role] ?? "neutral"} dot={false}>
                  {ROLE_LABEL[m.role] ?? m.role}
                </Badge>
                {canRemoveMember(role, status, m) ? (
                  <Button variant="secondary" size="sm" className="border-danger-600 text-danger-600" disabled={busy !== null} onClick={() => setRemove(m)}>
                    Keluarkan
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Dialog
        open={remove !== null}
        onClose={() => (busy ? undefined : setRemove(null))}
        title="Keluarkan anggota?"
        description={remove ? `${remove.name} tidak lagi menjadi anggota "${orgName}". Listing mereka tetap milik mereka, tetapi tidak lagi memakai kuota organisasi.` : undefined}
        footer={
          <>
            <Button variant="secondary" disabled={busy !== null} onClick={() => setRemove(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              loading={busy === "remove"}
              onClick={() => {
                const m = remove;
                if (!m) return;
                void act("remove", () => api.delete(`/organization-members/${m.memberId}`, { idempotency: true }), `${m.name} dikeluarkan dari organisasi.`).then(() => setRemove(null));
              }}
            >
              Ya, Keluarkan
            </Button>
          </>
        }
      />

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Undang Anggota"
        description={`Cari Agent berdasarkan nama atau nomor lisensi. Undangan berlaku ${INVITE_DAYS} hari. Hanya Agent dengan profil publik yang bisa dicari.`}
        footer={
          <Button variant="secondary" onClick={() => setInviteOpen(false)}>
            Tutup
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <label htmlFor="org-invite-q" className="sr-only">
            Cari nama atau nomor lisensi
          </label>
          <Input id="org-invite-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau nomor lisensi agen…" autoComplete="off" />
          <div className="max-h-56 overflow-y-auto" aria-live="polite">
            {found === "loading" ? (
              <p className="p-3 text-caption">Mencari…</p>
            ) : found === "error" ? (
              <p role="alert" className="p-3 text-body-md text-danger-600">
                Pencarian gagal. Coba lagi.
              </p>
            ) : q.trim().length < 2 ? (
              <p className="p-3 text-caption">Ketik minimal 2 huruf.</p>
            ) : found.length === 0 ? (
              <p className="p-3 text-caption">Tidak ada Agent publik yang cocok, atau sudah menjadi anggota/diundang.</p>
            ) : (
              <ul>
                {found.map((a) => (
                  <li key={a.agent_id} className="flex items-center gap-3 py-2">
                    <Avatar name={a.agent_name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label-lg">{a.agent_name}</span>
                      <span className="block truncate text-caption">{[a.agent_area, a.agent_office].filter(Boolean).join(" · ")}</span>
                    </span>
                    <Button size="sm" loading={busy === `inv-${a.agent_id}`} disabled={busy !== null} onClick={() => void invite(a)}>
                      Undang
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
