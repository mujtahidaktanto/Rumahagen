"use client";

// components/admin/CourseFormDialog.tsx — Buat/Ubah Kursus (M04, wireframe M04-Form-Kursus): POST /courses (create) atau PUT /courses/{id} (edit). Field dasar saja (title/category/
// description/passing_grade/prerequisite_course_id) — organizer_type/certificate_template/signer/logo/quiz_*/awards_title_definition_id diatur di layar terpisah "Sertifikat Kursus"
// (staff-only, trigger DB terpisah). "Pemilik" (created_by) HANYA bisa ditetapkan saat membuat — updateCourseSchema tidak menerima created_by sama sekali.
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { CourseDetail, CoursePrereqPickerRow, InstructorPickerRow } from "@/lib/admin/course-data";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, type CourseCategory } from "@/lib/admin/course-labels";
import { ApiClientError, api } from "@/lib/api-client";

type CreatedCourse = { id: string };

export function CourseFormDialog({
  course,
  instructors,
  prereqOptions,
  trigger,
}: {
  course?: CourseDetail;
  instructors: InstructorPickerRow[];
  prereqOptions: CoursePrereqPickerRow[];
  trigger: (open: () => void) => React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = !!course;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(course?.title ?? "");
  const [category, setCategory] = useState<CourseCategory>((course?.category as CourseCategory) ?? "sales_skill");
  const [description, setDescription] = useState(course?.description ?? "");
  const [passingGrade, setPassingGrade] = useState(course ? String(course.passingGrade) : "70");
  const [prereq, setPrereq] = useState(course?.prerequisiteCourseId ?? "none");
  const [owner, setOwner] = useState("me");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setTitle(course?.title ?? "");
    setCategory((course?.category as CourseCategory) ?? "sales_skill");
    setDescription(course?.description ?? "");
    setPassingGrade(course ? String(course.passingGrade) : "70");
    setPrereq(course?.prerequisiteCourseId ?? "none");
    setOwner("me");
    setError(null);
    setOpen(true);
  }

  const grade = Number(passingGrade);
  const canSave = title.trim().length > 0 && Number.isInteger(grade) && grade >= 0 && grade <= 100;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(
          `/courses/${course.id}`,
          { title: title.trim(), category, description: description.trim() || undefined, passing_grade: grade, prerequisite_course_id: prereq === "none" ? null : prereq },
          { idempotency: true },
        );
        setOpen(false);
        router.refresh();
      } else {
        const res = await api.post<CreatedCourse>(
          "/courses",
          {
            title: title.trim(),
            category,
            description: description.trim() || undefined,
            passing_grade: grade,
            prerequisite_course_id: prereq === "none" ? undefined : prereq,
            created_by: owner === "me" ? undefined : owner,
          },
          { idempotency: true },
        );
        setOpen(false);
        router.push(`/admin/kursus/${res.data.id}` as Route);
      }
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={isEdit ? "Ubah Kursus" : "Buat Kursus"}
        description={isEdit ? undefined : "Kursus baru selalu berstatus Draf. Menerbitkan hanya bisa staf, dari halaman detail, setelah pelajaran dan kuis siap."}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!canSave} onClick={() => void save()}>
              {isEdit ? "Simpan" : "Simpan Kursus"}
            </Button>
          </>
        }
      >
        <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto pr-1">
          <Field label="Judul kursus" required>
            {(a) => <Input {...a} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
          <Field label="Kategori">
            {(a) => (
              <Select {...a} value={category} onChange={(e) => setCategory(e.target.value as CourseCategory)}>
                {COURSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {COURSE_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Deskripsi">{(a) => <Textarea {...a} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />}</Field>
          <Field label="Nilai lulus (0–100)" hint="Berlaku untuk semua kuis pada kursus ini.">
            {(a) => <Input {...a} type="number" min={0} max={100} className="max-w-[160px]" value={passingGrade} onChange={(e) => setPassingGrade(e.target.value)} />}
          </Field>
          <Field label="Prasyarat kursus" hint="Opsional. Peserta hanya bisa mendaftar bila prasyarat sudah selesai.">
            {(a) => (
              <Select {...a} value={prereq} onChange={(e) => setPrereq(e.target.value)}>
                <option value="none">Tanpa prasyarat</option>
                {prereqOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {!isEdit ? (
            <Field label="Dikelola oleh" hint="Pemilik hanya bisa ditetapkan saat membuat kursus.">
              {(a) => (
                <Select {...a} value={owner} onChange={(e) => setOwner(e.target.value)}>
                  <option value="me">Saya sendiri</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.label} (Instruktur)
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          ) : null}
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
