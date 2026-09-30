"use client";

// components/instructor/CourseFormView.tsx — Buat Kursus (M04, wireframe 04-Instructor/M04-Form-Kursus): halaman penuh terpisah (bukan dialog, sesuai wireframe), hanya create.
// Mengedit field yang sama dilakukan inline di tab Ringkasan Detail Kursus (pola sama seperti Form Sesi/Detail Sesi Instructor sebelumnya). Kursus baru selalu berstatus draft
// (trigger enforce_course_status_workflow menolak status lain dari non-staf saat INSERT) — form ini tidak menawarkan pemilih status maupun "Dikelola oleh" (selalu diri sendiri,
// beda dari CourseFormDialog Admin yang punya pemilih instruktur).
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, EMPTY_COURSE, validateCourseForm, toCoursePayload, type CourseCategory, type CourseForm } from "@/lib/instructor/course-rules";
import type { CoursePrereqPickerRow } from "@/lib/instructor/course-data";
import { ApiClientError, api } from "@/lib/api-client";

type CreatedCourse = { id: string };

export function CourseFormView({ prereqOptions }: { prereqOptions: CoursePrereqPickerRow[] }) {
  const router = useRouter();
  const [f, setF] = useState<CourseForm>(EMPTY_COURSE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = validateCourseForm(f);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<CreatedCourse>("/courses", toCoursePayload(f), { idempotency: true });
      router.push(`/instructor/kursus/${res.data.id}` as Route);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 p-4 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-headline">Buat Kursus</h1>
        <LinkButton href={"/instructor/kursus" as Route} variant="secondary">
          Batal
        </LinkButton>
      </div>
      <p className="text-caption">Kursus baru selalu berstatus Draf. Setelah menambahkan pelajaran dan kuis, ajukan untuk ditinjau agar diterbitkan tim RumahAgen.</p>

      <div className="flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
        <Field label="Judul kursus" required>
          {(a) => <Input {...a} maxLength={200} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />}
        </Field>
        <Field label="Kategori">
          {(a) => (
            <Select {...a} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as CourseCategory })}>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {COURSE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Deskripsi">{(a) => <Textarea {...a} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />}</Field>
        <Field label="Nilai lulus (0–100)" hint="Berlaku untuk semua kuis pada kursus ini.">
          {(a) => <Input {...a} type="number" min={0} max={100} className="max-w-[160px]" value={f.passingGrade} onChange={(e) => setF({ ...f, passingGrade: e.target.value })} />}
        </Field>
        <Field label="Prasyarat kursus" hint="Opsional. Peserta hanya bisa mendaftar bila prasyarat sudah selesai.">
          {(a) => (
            <Select {...a} value={f.prerequisiteCourseId} onChange={(e) => setF({ ...f, prerequisiteCourseId: e.target.value })}>
              <option value="none">Tanpa prasyarat</option>
              {prereqOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2.5 pt-1.5">
          <Button loading={busy} disabled={!canSave} onClick={() => void save()}>
            Simpan Kursus
          </Button>
        </div>
      </div>
    </div>
  );
}
