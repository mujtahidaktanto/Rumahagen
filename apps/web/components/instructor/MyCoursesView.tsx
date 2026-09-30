// components/instructor/MyCoursesView.tsx — Kursus Saya (M04, wireframe 04-Instructor/M04-Kursus-Saya): daftar kursus milik sendiri, filter status/kategori/cari lewat query
// string (GET biasa, tanpa JS klien untuk filter — pola sama seperti CourseListView Admin). Server Component murni (tombol "+ Buat Kursus" adalah Link ke halaman form
// terpisah, bukan dialog, jadi tidak perlu "use client" atau meneruskan fungsi trigger ke Client Component).
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { CourseListRow } from "@/lib/instructor/course-data";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, COURSE_STATUS_LABEL, COURSE_STATUS_TONE, type CourseStatus } from "@/lib/instructor/course-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const STATUSES: CourseStatus[] = ["draft", "pending_review", "published", "archived"];

function statusHref(status: CourseStatus | "all", category: string, q: string): Route {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category !== "all") params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  return (qs ? `/instructor/kursus?${qs}` : "/instructor/kursus") as Route;
}

export function MyCoursesView({ courses, status, category, q }: { courses: Part<CourseListRow[]>; status: CourseStatus | "all"; category: string; q: string }) {
  const all = courses.ok ? courses.data : [];
  const counts: Record<string, number> = { all: all.length };
  for (const c of all) counts[c.status] = (counts[c.status] ?? 0) + 1;

  const filtered = all.filter((c) => (status === "all" || c.status === status) && (category === "all" || c.category === category) && (!q || c.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Kursus Saya</h1>
          <p className="text-caption">Katalog pembelajaran self-paced yang Anda kelola</p>
        </div>
        <LinkButton href={"/instructor/kursus/baru" as Route}>+ Buat Kursus</LinkButton>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
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
          <p className="py-16 text-center text-body-md text-ink-500">{all.length === 0 ? "Belum ada kursus. Buat kursus pertama Anda." : "Tidak ada kursus yang cocok dengan filter ini."}</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Kursus</TH>
                <TH>Kategori</TH>
                <TH>Pelajaran</TH>
                <TH>Kuis</TH>
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
                  <TD className="text-body-md">{c.lessonCount}</TD>
                  <TD className="text-body-md">{c.quizCount}</TD>
                  <TD>
                    <Badge tone={COURSE_STATUS_TONE[c.status]}>{COURSE_STATUS_LABEL[c.status]}</Badge>
                  </TD>
                  <TD>
                    <LinkButton href={`/instructor/kursus/${c.id}` as Route} variant="secondary" size="sm">
                      Kelola
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
