// components/public/LearningCards.tsx — kartu Learning publik: CourseCard (judul, kategori, jumlah materi, ringkasan) dan SessionCard (judul, tipe, jadwal, status). Tautan ke halaman detail.
import Link from "next/link";
import type { Route } from "next";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { BookIcon, ClockIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/format";
import {
  COURSE_CATEGORY_LABEL,
  SESSION_STATUS_LABEL,
  SESSION_TYPE_LABEL,
  sessionTitle,
  type CourseSummary,
  type SessionSummary,
} from "@/lib/public/learning-data";
import { excerptOf } from "@/lib/public/rich-text";

// Nada badge status sesi mengikuti wireframe: scheduled info, live danger, ended/cancelled/draft neutral, failed danger.
export const SESSION_STATUS_TONE: Record<string, BadgeTone> = { scheduled: "info", live: "danger", ended: "neutral", cancelled: "neutral", failed: "danger", draft: "neutral" };

export function CourseCard({ course: c }: { course: CourseSummary }) {
  return (
    <Link
      href={`/learning/${c.id}` as Route}
      className="flex h-full min-w-0 flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5 text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-100 text-blue-600">
          <BookIcon size={18} />
        </span>
        <Badge tone="info" dot={false}>
          {COURSE_CATEGORY_LABEL[c.category] ?? c.category}
        </Badge>
      </span>
      <span className="line-clamp-2 min-h-11 text-title-md text-ink-900">{c.title}</span>
      <span className="line-clamp-2 min-h-10 text-body-md text-ink-500">{excerptOf(c.description)}</span>
      <span className="mt-auto text-caption">{c.lessonCount} materi</span>
    </Link>
  );
}

export function SessionCard({ session: s }: { session: SessionSummary }) {
  return (
    <Link
      href={`/learning-session/${s.id}` as Route}
      className="flex h-full min-w-0 flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5 text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-100 text-blue-600">
          <ClockIcon size={18} />
        </span>
        <Badge tone={SESSION_STATUS_TONE[s.status] ?? "neutral"}>{SESSION_STATUS_LABEL[s.status] ?? s.status}</Badge>
      </span>
      <span className="line-clamp-2 min-h-11 text-title-md text-ink-900">{sessionTitle(s)}</span>
      <span className="text-body-md text-ink-500">{SESSION_TYPE_LABEL[s.session_type] ?? s.session_type}</span>
      <span className="mt-auto text-caption">{s.session_type === "on_demand" ? "On-demand" : formatDateTime(s.start_at) || "Jadwal belum ditentukan"}</span>
    </Link>
  );
}
