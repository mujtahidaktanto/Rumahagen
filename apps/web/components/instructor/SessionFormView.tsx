"use client";

// components/instructor/SessionFormView.tsx — Buat Sesi (M04, wireframe 04-Instructor/M04-Form-Sesi): POST /learning/sessions. organization_id dan event_id TIDAK ditawarkan
// di form ini (dipersempit dari skema penuh) — keduanya opsional dan jarang dipakai; bisa ditambah lewat PUT /learning/sessions/{id} langsung bila dibutuhkan nanti, dicatat
// di audit/FRONTEND_GAPS.md. Mengubah sesi yang sudah ada (field inti + status) dilakukan di Detail Sesi, bukan di sini.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { ChevronLeftIcon } from "@/components/ui/icons";
import type { CourseOption } from "@/lib/instructor/session-data";
import { EMPTY_SESSION, validateSessionForm, toSessionPayload, type SessionErrors, type SessionForm } from "@/lib/instructor/session-rules";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";

export function SessionFormView({ courses }: { courses: Part<CourseOption[]> }) {
  const router = useRouter();
  const [f, setF] = useState<SessionForm>(EMPTY_SESSION);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors: SessionErrors = tried ? validateSessionForm(f) : {};
  const courseList = courses.ok ? courses.data : [];

  function set<K extends keyof SessionForm>(k: K, v: SessionForm[K]) {
    setF((x) => ({ ...x, [k]: v }));
  }

  async function save() {
    setTried(true);
    if (Object.keys(validateSessionForm(f)).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ id: string }>("/learning/sessions", toSessionPayload(f), { idempotency: true });
      router.push(`/instructor/sesi/${res.data.id}` as Route);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Sesi gagal dibuat. Data Anda masih di form; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[600px] p-4 lg:p-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href={"/instructor/sesi" as Route} aria-label="Kembali ke Sesi Saya" className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-700 hover:bg-ink-50">
          <ChevronLeftIcon size={20} />
        </Link>
        <h1 className="text-headline">Buat Sesi</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5 sm:p-6">
        <Field label="Jenis Sesi">
          {(a) => (
            <Select {...a} value={f.sessionType} onChange={(e) => set("sessionType", e.target.value as SessionForm["sessionType"])}>
              <option value="broadcast">Broadcast</option>
              <option value="interactive">Interaktif</option>
              <option value="on_demand">On-Demand</option>
            </Select>
          )}
        </Field>
        <Field label="Kursus terkait" hint={courses.ok ? "Opsional." : "Daftar kursus gagal dimuat. Muat ulang halaman bila ingin memilih."}>
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

        <div className="flex justify-end gap-3">
          <Link href={"/instructor/sesi" as Route} className="inline-flex h-11 items-center rounded-md border-[1.5px] border-ink-100 px-5 text-label-lg no-underline hover:no-underline">
            Batal
          </Link>
          <Button loading={busy} disabled={busy} onClick={() => void save()}>
            Buat Sesi
          </Button>
        </div>
      </div>
    </div>
  );
}
