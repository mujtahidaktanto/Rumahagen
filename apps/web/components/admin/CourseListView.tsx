// components/admin/CourseListView.tsx — Kelola Kursus (M04, wireframe M04-Kelola-Kursus): daftar courses lintas pemilik (RLS courses_select meloloskan SEMUA status untuk staf, bukan hanya
// published). Filter status (chip link), kategori dan pencarian judul lewat GET form biasa (query string) — konsisten pola AuditOversightView, tanpa JS klien untuk filter.
import Link from "next/link";
import type { Route } from "next";
import { CourseFormDialog } from "@/components/admin/CourseFormDialog";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, COURSE_STATUS_LABEL, COURSE_STATUS_TONE, type CourseListRow, type CourseStatus } from "@/lib/admin/course-data";
import type { CoursePrereqPickerRow, InstructorPickerRow } from "@/lib/admin/course-data";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const STATUSES: CourseStatus[] = ["draft", "pending_review", "published", "archived"];

function statusHref(status: CourseStatus | "all", category: string, q: string): Route {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category !== "all") params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  return (qs ? `/admin/kursus?${qs}` : "/admin/kursus") as Route;
}

export function CourseListView({
  courses,
  status,
  category,
  q,
  instructors,
  prereqOptions,
}: {
  courses: Part<CourseListRow[]>;
  status: CourseStatus | "all";
  category: string;
  q: string;
  instructors: InstructorPickerRow[];
  prereqOptions: CoursePrereqPickerRow[];
}) {
  const all = courses.ok ? courses.data : [];
  const counts: Record<string, number> = { all: all.length };
  for (const c of all) counts[c.status] = (counts[c.status] ?? 0) + 1;
  const pendingCount = counts.pending_review ?? 0;

  const filtered = all.filter((c) => (status === "all" || c.status === status) && (category === "all" || c.category === category) && (!q || c.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Kelola Kursus</h1>
          <p className="text-caption">Katalog pembelajaran self-paced (terpisah dari sesi live)</p>
        </div>
        <div className="flex items-center gap-3">
          <LinkButton href={"/admin/konfigurasi-belajar" as Route} variant="secondary">
            Konfigurasi Belajar
          </LinkButton>
          <CourseFormDialog instructors={instructors} prereqOptions={prereqOptions} trigger={(open) => <Button onClick={open}>+ Buat Kursus</Button>} />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {pendingCount > 0 ? (
          <div className="rounded-md border border-warning-200 bg-warning-100 p-3.5 text-body-md text-warning-600">
            <strong>{pendingCount} kursus menunggu tinjauan.</strong> Buka kursus untuk menyetujui atau mengembalikan ke draf dengan catatan.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", ...STATUSES] as const).map((s) => (
              <Link
                key={s}
                href={statusHref(s, category, q)}
                className={`rounded-pill border px-3 py-1.5 text-[13px] font-bold ${status === s ? "border-blue-600 bg-blue-50 text-blue-600" : "border-ink-100 text-ink-500 hover:border-blue-500"}`}
              >
                {s === "all" ? "Semua" : COURSE_STATUS_LABEL[s]} <span className="text-ink-300">{counts[s] ?? 0}</span>
              </Link>
            ))}
          </div>
          <div className="flex-1" />
          <form method="GET" className="flex flex-wrap gap-2.5">
            {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
            <Select name="category" defaultValue={category} className="w-[200px]">
              <option value="all">Semua kategori</option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {COURSE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
            <Input name="q" type="search" defaultValue={q} placeholder="Cari judul…" className="w-[220px]" />
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>
        </div>

        {!courses.ok ? (
          <ErrorState title="Daftar kursus gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-body-md text-ink-500">{all.length === 0 ? "Belum ada kursus. Buat kursus pertama untuk katalog pembelajaran." : "Tidak ada kursus yang cocok dengan filter ini."}</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Kursus</TH>
                <TH>Kategori</TH>
                <TH>Pemilik</TH>
                <TH>Pelajaran</TH>
                <TH>Kuis</TH>
                <TH>Peserta</TH>
                <TH>Status</TH>
                <TH>Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="max-w-[300px] text-label-lg">{c.title}</div>
                    <div className="text-caption">Nilai lulus {c.passingGrade}</div>
                    {c.reviewNote && c.status === "draft" ? <div className="max-w-[300px] text-caption text-danger-600">Dikembalikan: {c.reviewNote}</div> : null}
                  </TD>
                  <TD className="text-body-md">{c.category ? COURSE_CATEGORY_LABEL[c.category] : "—"}</TD>
                  <TD className="max-w-[170px] truncate text-body-md">{c.ownerLabel}</TD>
                  <TD className="text-body-md">{c.lessonCount}</TD>
                  <TD className="text-body-md">{c.quizCount}</TD>
                  <TD className="text-body-md">{c.enrollmentCount}</TD>
                  <TD>
                    <Badge tone={COURSE_STATUS_TONE[c.status]}>{COURSE_STATUS_LABEL[c.status]}</Badge>
                    {c.status === "pending_review" && c.submittedForReviewAt ? <div className="text-caption">Diajukan {dtf.format(new Date(c.submittedForReviewAt))}</div> : null}
                  </TD>
                  <TD>
                    <LinkButton href={`/admin/kursus/${c.id}` as Route} variant={c.status === "pending_review" ? "primary" : "secondary"} size="sm">
                      {c.status === "pending_review" ? "Tinjau" : "Kelola"}
                    </LinkButton>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
