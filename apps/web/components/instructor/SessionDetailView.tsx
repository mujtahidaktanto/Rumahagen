"use client";

// components/instructor/SessionDetailView.tsx — Detail Sesi (M04, wireframe 04-Instructor/M04-Detail-Sesi): ringkasan + ubah field inti + transisi status, peserta &
// kehadiran, penyelesaian, artefak, tim pengampu (baca saja — penugasan hanya staf, SOURCE-Instructor.md §7 "session_assignment.assign" tidak dimiliki Instructor).
// Tidak ada trigger urutan status di DB untuk learning_sessions (beda dari developer_projects/events) — semua 6 status bisa dipilih bebas sesuai izin pemanggil.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { ErrorState } from "@/components/ui/States";
import { formatDateTime } from "@/lib/format";
import type { ArtifactRow, CourseOption, RosterRow, SessionDetail, TeamRow } from "@/lib/instructor/session-data";
import {
  CAPABILITY_LABEL,
  ENROLLMENT_STATUS_LABEL,
  SESSION_STATUS_OPTIONS,
  SESSION_TYPE_LABEL,
  enrollmentStatus,
  isoToWibLocal,
  sessionStatus,
  toSessionPayload,
  validateSessionForm,
  type SessionForm,
} from "@/lib/instructor/session-rules";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";

function formFrom(s: SessionDetail): SessionForm {
  return { sessionType: s.sessionType as SessionForm["sessionType"], courseId: s.courseId ?? "", startAt: isoToWibLocal(s.startAt), endAt: isoToWibLocal(s.endAt), visibility: s.visibility as SessionForm["visibility"] };
}

export function SessionDetailView({
  session,
  courses,
  roster,
  team,
  artifacts,
}: {
  session: SessionDetail;
  courses: Part<CourseOption[]>;
  roster: Part<RosterRow[]>;
  team: Part<TeamRow[]>;
  artifacts: Part<ArtifactRow[]>;
}) {
  const router = useRouter();
  const initial = formFrom(session);
  const [f, setF] = useState<SessionForm>(initial);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const errors = tried ? validateSessionForm(f) : {};
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const st = sessionStatus(session.status);
  const courseList = courses.ok ? courses.data : [];

  function set<K extends keyof SessionForm>(k: K, v: SessionForm[K]) {
    setF((x) => ({ ...x, [k]: v }));
    setError(null);
  }

  async function save() {
    setTried(true);
    if (Object.keys(validateSessionForm(f)).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(`/learning/sessions/${session.id}`, toSessionPayload(f));
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: string) {
    setStatusBusy(true);
    setError(null);
    try {
      await api.patch(`/learning/sessions/${session.id}/status`, { status }, { idempotency: true });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Status gagal diubah. Coba lagi.");
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <div className="flex items-center gap-3">
        <Link href={"/instructor/sesi" as Route} aria-label="Kembali ke Sesi Saya" className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-700 hover:bg-ink-50">
          <ChevronLeftIcon size={20} />
        </Link>
        <h1 className="text-headline">{session.courseTitle ?? `Sesi ${SESSION_TYPE_LABEL[session.sessionType] ?? session.sessionType}`}</h1>
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <h2 className="text-title-md">Status</h2>
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {SESSION_STATUS_OPTIONS.map((s) => (
            <Button key={s} variant={session.status === s ? "primary" : "secondary"} size="sm" disabled={statusBusy || session.status === s} onClick={() => void changeStatus(s)}>
              {sessionStatus(s).label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <h2 className="mb-3.5 text-title-md">Informasi Sesi</h2>
        <div className="flex flex-col gap-3.5">
          <Field label="Jenis Sesi">
            {(a) => (
              <Select {...a} value={f.sessionType} onChange={(e) => set("sessionType", e.target.value as SessionForm["sessionType"])}>
                <option value="broadcast">Broadcast</option>
                <option value="interactive">Interaktif</option>
                <option value="on_demand">On-Demand</option>
              </Select>
            )}
          </Field>
          <Field label="Kursus terkait" hint={courses.ok ? "Opsional." : "Daftar kursus gagal dimuat."}>
            {(a) => (
              <Select {...a} value={f.courseId} disabled={!courses.ok} onChange={(e) => set("courseId", e.target.value)}>
                <option value="">Tidak terkait</option>
                {courseList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mulai (WIB)" required error={errors.startAt}>
              {(a) => <Input {...a} type="datetime-local" value={f.startAt} onChange={(e) => set("startAt", e.target.value)} />}
            </Field>
            <Field label="Selesai (WIB), opsional" error={errors.endAt}>
              {(a) => <Input {...a} type="datetime-local" value={f.endAt} onChange={(e) => set("endAt", e.target.value)} />}
            </Field>
          </div>
          <Field label="Visibilitas">
            {(a) => (
              <Select {...a} value={f.visibility} onChange={(e) => set("visibility", e.target.value as SessionForm["visibility"])}>
                <option value="public">Publik</option>
                <option value="organization">Organisasi</option>
                <option value="partner">Mitra</option>
                <option value="private">Privat</option>
              </Select>
            )}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
          {dirty ? (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" disabled={busy} onClick={() => setF(initial)}>
                Batalkan
              </Button>
              <Button loading={busy} onClick={() => void save()}>
                Simpan Perubahan
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <h2 className="mb-3.5 text-title-md">Peserta &amp; Kehadiran</h2>
        {!roster.ok ? (
          <ErrorState title="Peserta gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : roster.data.length === 0 ? (
          <p className="py-6 text-center text-body-md text-ink-500">Belum ada peserta terdaftar.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-50">
            {roster.data.map((r) => (
              <RosterItem key={r.enrollmentId} sessionId={session.id} row={r} />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <h2 className="mb-3.5 text-title-md">Tim Pengampu</h2>
        {!team.ok ? (
          <ErrorState title="Tim gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : team.data.length === 0 ? (
          <p className="py-6 text-center text-body-md text-ink-500">Belum ada penugasan Host/Instruktur lain. Penugasan hanya bisa dilakukan tim RumahAgen.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-50">
            {team.data.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-body-md text-ink-900">{t.actorName}</span>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{CAPABILITY_LABEL[t.capability] ?? t.capability}</Badge>
                  <Badge tone={t.status === "ACTIVE" ? "success" : "neutral"}>{t.status === "ACTIVE" ? "Aktif" : "Dicabut"}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ArtifactsCard sessionId={session.id} artifacts={artifacts} />
    </div>
  );
}

function RosterItem({ sessionId, row }: { sessionId: string; row: RosterRow }) {
  const es = enrollmentStatus(row.enrollmentStatus);
  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-label-lg text-ink-900">{row.agentName}</span>
          <Badge tone={es.tone} className="ml-2">
            {es.label}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption">Kehadiran: {row.attendanceResult ?? "belum dinilai"}</span>
          <AttendanceDialog sessionId={sessionId} row={row} />
          <span className="text-caption">Penyelesaian: {row.completionResult ?? "belum dinilai"}</span>
          <CompletionDialog sessionId={sessionId} row={row} />
        </div>
      </div>
    </li>
  );
}

function AttendanceDialog({ sessionId, row }: { sessionId: string; row: RosterRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [policy, setPolicy] = useState("v1");
  const [result, setResult] = useState(row.attendanceResult ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!result.trim()) {
      setError("Hasil wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/learning/sessions/${sessionId}/attendance/evaluate`, { session_enrollment_id: row.enrollmentId, policy_version: policy.trim(), result: result.trim() }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Nilai Kehadiran
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Nilai Kehadiran — ${row.agentName}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Versi kebijakan">{(a) => <Input {...a} value={policy} onChange={(e) => setPolicy(e.target.value)} />}</Field>
          <Field label="Hasil" required hint="Teks bebas, mis. hadir, tidak hadir, terlambat.">
            {(a) => <Input {...a} value={result} onChange={(e) => setResult(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}

function CompletionDialog({ sessionId, row }: { sessionId: string; row: RosterRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [policy, setPolicy] = useState("v1");
  const [result, setResult] = useState(row.completionResult ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!result.trim()) {
      setError("Hasil wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(
        `/learning/sessions/${sessionId}/completion/evaluate`,
        { session_enrollment_id: row.enrollmentId, attendance_evaluation_id: row.attendanceEvaluationId ?? undefined, completion_policy_version: policy.trim(), result: result.trim() },
        { idempotency: true },
      );
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Nilai Penyelesaian
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Nilai Penyelesaian — ${row.agentName}`}
        description="Butuh status pendaftaran aktif atau selesai (ditegakkan server)."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Versi kebijakan">{(a) => <Input {...a} value={policy} onChange={(e) => setPolicy(e.target.value)} />}</Field>
          <Field label="Hasil" required hint="Teks bebas, mis. lulus, tidak lulus.">
            {(a) => <Input {...a} value={result} onChange={(e) => setResult(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}

function ArtifactsCard({ sessionId, artifacts }: { sessionId: string; artifacts: Part<ArtifactRow[]> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [artifactType, setArtifactType] = useState("recording");
  const [sourceUrl, setSourceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!artifactType.trim()) {
      setError("Jenis artefak wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/learning/sessions/${sessionId}/artifacts`, { artifact_type: artifactType.trim(), source_url: sourceUrl.trim() || undefined }, { idempotency: true });
      setOpen(false);
      setSourceUrl("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-title-md">Artefak</h2>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          + Tambah Artefak
        </Button>
      </div>
      {!artifacts.ok ? (
        <ErrorState title="Artefak gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : artifacts.data.length === 0 ? (
        <p className="py-6 text-center text-body-md text-ink-500">Belum ada artefak (rekaman, materi, dsb.).</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-50">
          {artifacts.data.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <span className="text-body-md text-ink-900">{a.artifactType}</span>
                {a.sourceUrl ? (
                  <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 text-caption text-blue-600">
                    Buka
                  </a>
                ) : null}
              </div>
              <Badge tone={a.status === "available" ? "success" : a.status === "pending" ? "warning" : "neutral"}>{a.status}</Badge>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Tambah Artefak"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void add()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Jenis artefak" required hint="Teks bebas, mis. recording, materi, notulensi.">
            {(a) => <Input {...a} value={artifactType} onChange={(e) => setArtifactType(e.target.value)} />}
          </Field>
          <Field label="Tautan sumber" hint="Opsional. https://…">
            {(a) => <Input {...a} type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />}
          </Field>
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
