// lib/agent/learning-rules.ts — aturan murni layar Pembelajaran Agent (M04): progres pelajaran, label status, riwayat Learning Points. Tanpa I/O agar aman dipakai komponen klien dan diuji.
//
// Progres pelajaran: server hanya menyimpan `enrollments.progress_percent` (0–99 untuk peserta; 100 hanya lewat kuis lulus, migration 0130) — tidak ada tabel penyelesaian per pelajaran.
// Maka pelajaran diselesaikan BERURUTAN dan progres disandikan: k pelajaran selesai dari n = round(k/n × 90)%. Sisa 10% = kuis akhir. Kursus `completed` = semuanya selesai.
import type { BadgeTone } from "@/components/ui/Badge";

export const LESSON_PROGRESS_CAP = 90;

/** Progres (%) yang dikirim ke server setelah k dari n pelajaran selesai (maks 90; 100 hanya lewat kuis lulus). */
export function progressForDone(done: number, total: number): number {
  if (total <= 0 || done <= 0) return 0;
  return Math.min(LESSON_PROGRESS_CAP, Math.round((Math.min(done, total) / total) * LESSON_PROGRESS_CAP));
}

/** Jumlah pelajaran yang dianggap selesai dari progres tersimpan. */
export function doneFromProgress(progress: number, total: number, completed: boolean): number {
  if (total <= 0) return 0;
  if (completed) return total;
  return Math.max(0, Math.min(total, Math.round((Math.max(0, progress) / LESSON_PROGRESS_CAP) * total)));
}

/** Pelajaran ke-`index` (0-based) boleh ditandai selesai hanya bila semua sebelumnya sudah selesai dan ia belum selesai. */
export const canMarkLesson = (index: number, done: number) => index === done;

// ── Label status (nilai CHECK apa adanya) ──
export const ENROLLMENT_TONE: Record<string, BadgeTone> = { in_progress: "info", completed: "success" };
export const SESSION_ENROLLMENT_TONE: Record<string, BadgeTone> = { pending: "warning", active: "info", completed: "success" };
export const CERT_TONE: Record<string, BadgeTone> = { issued: "success", revoked: "danger", missing: "neutral" };
export const CERT_LABEL: Record<string, string> = { issued: "Terbit", revoked: "Dicabut", missing: "Belum diterbitkan" };

export const LESSON_TYPE_NOUN: Record<string, string> = { video: "video", pdf: "PDF", slide: "slide" };

// ── Learning Points ──
export const LP_TX_LABEL: Record<string, string> = {
  earned: "Poin didapat",
  purchased: "Pembelian Learning Points",
  redeemed: "Penukaran poin",
  used: "Pemakaian poin",
  adjustment: "Penyesuaian poin",
  reversal: "Pembatalan transaksi",
};

export function lpAmountLabel(amount: number): string {
  const n = Math.abs(amount);
  const txt = Number.isInteger(n) ? n.toLocaleString("id-ID") : n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  return `${amount < 0 ? "−" : "+"}${txt} LP`;
}

// ── Kuis ──
export type QuizAttemptStatus = {
  limited: boolean;
  attempts_used: number;
  max_attempts: number | null;
  cooldown_minutes: number;
  next_allowed_at: string | null;
  can_attempt: boolean;
};

/** Pesan bila kuis belum boleh dikerjakan (batas percobaan atau jeda kursus pihak ketiga); null = boleh. */
export function attemptBlockMessage(s: QuizAttemptStatus | null, now: Date = new Date()): string | null {
  if (!s || s.can_attempt) return null;
  if (s.next_allowed_at) {
    const ms = new Date(s.next_allowed_at).getTime() - now.getTime();
    if (ms > 0) {
      const min = Math.ceil(ms / 60_000);
      return `Anda bisa mencoba lagi dalam ${min >= 60 ? `${Math.ceil(min / 60)} jam` : `${min} menit`}.`;
    }
  }
  if (s.max_attempts != null && s.attempts_used >= s.max_attempts) return `Batas ${s.max_attempts} percobaan kuis sudah terpakai.`;
  return "Kuis belum bisa dikerjakan saat ini.";
}

export type QuizQuestion = { id: string; question_text: string; question_type: "single_choice" | "multi_choice"; options: { id: string; option_text: string }[] };
export type Answers = Record<string, string[]>;

/** Pilih/lepas opsi: pilihan tunggal menggantikan, pilihan ganda menukar (toggle). */
export function toggleAnswer(answers: Answers, q: Pick<QuizQuestion, "id" | "question_type">, optionId: string): Answers {
  const cur = answers[q.id] ?? [];
  if (q.question_type === "single_choice") return { ...answers, [q.id]: [optionId] };
  return { ...answers, [q.id]: cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId] };
}

/** Semua soal wajib dijawab (server memakai seluruh soal kuis sebagai penyebut nilai). */
export function unansweredCount(questions: Pick<QuizQuestion, "id">[], answers: Answers): number {
  return questions.filter((q) => (answers[q.id] ?? []).length === 0).length;
}

export function toSubmitPayload(enrollmentId: string, questions: Pick<QuizQuestion, "id">[], answers: Answers) {
  return { enrollment_id: enrollmentId, answers: questions.map((q) => ({ question_id: q.id, selected_option_ids: answers[q.id] ?? [] })) };
}

/** Hanya tautan https yang dipakai untuk materi (bukan javascript:/data:). */
export function safeHttps(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Tautan YouTube (watch / youtu.be / embed) -> alamat sematan tanpa cookie pelacak; selain itu null. */
export function youtubeEmbedUrl(raw: string | null | undefined): string | null {
  const href = safeHttps(raw);
  if (!href) return null;
  const u = new URL(href);
  const host = u.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0] || null;
  else if (host === "youtube.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2] || null;
  }
  return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
