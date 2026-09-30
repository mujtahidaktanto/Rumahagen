// lib/instructor/session-rules.ts — aturan murni Sesi (M04, area Instructor). Label DIPAKAI ULANG dari lib/public/learning-data.ts (sudah dipakai sisi publik/Agent, murni tanpa I/O);
// tone badge dan sessionStatus() ditambahkan di sini karena sisi publik tidak butuh Badge.
import type { BadgeTone } from "@/components/ui/Badge";
import { SESSION_STATUS_LABEL, SESSION_TYPE_LABEL, SESSION_VISIBILITY_LABEL, sessionTitle } from "@/lib/public/learning-data";

export { SESSION_STATUS_LABEL, SESSION_TYPE_LABEL, SESSION_VISIBILITY_LABEL, sessionTitle };

export const SESSION_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  scheduled: "info",
  live: "success",
  ended: "neutral",
  cancelled: "danger",
  failed: "danger",
};
export const sessionStatus = (s: string) => ({ label: SESSION_STATUS_LABEL[s] ?? s, tone: SESSION_STATUS_TONE[s] ?? ("neutral" as BadgeTone) });
