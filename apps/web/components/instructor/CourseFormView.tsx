"use client";

// components/instructor/CourseFormView.tsx — Buat Kursus (M04, wireframe 04-Instructor/M04-Form-Kursus): halaman penuh terpisah (bukan dialog, sesuai wireframe), hanya create.
// Mengedit field yang sama dilakukan inline di tab Ringkasan Detail Kursus (pola sama seperti Form Sesi/Detail Sesi Instructor sebelumnya). Kursus baru selalu berstatus draft
// (trigger enforce_course_status_workflow menolak status lain dari non-staf saat INSERT) — form ini tidak menawarkan pemilih status maupun "Dikelola oleh" (selalu diri sendiri,
// beda dari CourseFormDialog Admin yang punya pemilih instruktur).
// Foto sampul (migration 0170) dipangkas rasio 16:9 lewat CropDialog — HARUS SAMA dengan aspect-[16/9] kartu "Course Saya" (components/agent/LearningView.tsx). Diunggah lewat
// POST /courses/cover-upload-url (tanpa course id — aman dipanggil sebelum course dibuat); URL hasilnya dikirim terpisah dari toCoursePayload (course-rules.ts tetap murni, tanpa
// state unggahan foto).
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, EMPTY_COURSE, validateCourseForm, toCoursePayload, type CourseCategory, type CourseForm } from "@/lib/instructor/course-rules";
import type { CoursePrereqPickerRow } from "@/lib/instructor/course-data";
import { ApiClientError, api } from "@/lib/api-client";
import { CropDialog } from "@/components/media/CropDialog";
import { loadSource, pickProblem, putToSignedUrl, type Encoded, type Source } from "@/lib/media/image-processing";
import { COURSE_COVER } from "@/lib/media/variants";

const COVER_FRAME = { w: 400, h: 225 };
type Picked = { enc: Encoded; preview: string } | null;
type UploadTarget = { upload_url: string; public_url: string };
type CreatedCourse = { id: string };

export function CourseFormView({ prereqOptions }: { prereqOptions: CoursePrereqPickerRow[] }) {
  const router = useRouter();
  const [f, setF] = useState<CourseForm>(EMPTY_COURSE);
  const [pick, setPick] = useState<Picked>(null);
  const [cropping, setCropping] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSave = validateCourseForm(f);

  async function onPickCover(files: FileList | null) {
    const file = files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setError(null);
    const problem = pickProblem(file);
    if (problem) return setError(problem);
    try {
      setCropping(await loadSource(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto tidak bisa dibuka. Coba foto lain.");
    }
  }

  function applyCroppedCover(enc: Encoded) {
    setCropping(null);
    setPick((old) => {
      if (old) URL.revokeObjectURL(old.preview);
      return { enc, preview: URL.createObjectURL(enc.blob) };
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      let coverImageUrl: string | undefined;
      if (pick) {
        const t = await api.post<UploadTarget>("/courses/cover-upload-url", { content_type: pick.enc.type }, { idempotency: true });
        await putToSignedUrl(t.data.upload_url, pick.enc.blob, pick.enc.type);
        coverImageUrl = t.data.public_url;
      }
      const res = await api.post<CreatedCourse>("/courses", { ...toCoursePayload(f), cover_image_url: coverImageUrl }, { idempotency: true });
      router.push(`/instructor/kursus/${res.data.id}` as Route);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
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
        <div className="flex flex-col gap-1.5">
          <span className="text-label-lg">Foto sampul</span>
          <div className="flex items-center gap-3">
            <span className="flex aspect-[16/9] h-16 flex-none items-center justify-center overflow-hidden rounded-md bg-ink-100 text-caption">
              {pick ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pick.preview} alt="" className="h-full w-full object-cover" />
              ) : (
                "Belum ada"
              )}
            </span>
            <span className="flex flex-col gap-1.5">
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => void onPickCover(e.target.files)} />
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
                {pick ? "Ganti & Atur" : "Unggah"}
              </Button>
            </span>
          </div>
          <p className="text-caption">JPG, PNG, atau WebP hingga 25 MB. Rasio 16:9 (sama seperti kartu kursus). Opsional.</p>
        </div>
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
      <CropDialog
        source={cropping}
        frame={COVER_FRAME}
        output={COURSE_COVER}
        title="Atur Foto Sampul"
        description="Geser dan zoom foto sampai bagian yang Anda mau pas di dalam bingkai."
        onCancel={() => setCropping(null)}
        onConfirm={applyCroppedCover}
      />
    </div>
  );
}
