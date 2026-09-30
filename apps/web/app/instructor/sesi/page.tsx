// app/instructor/sesi/page.tsx — Sesi Saya (M04, Fase 6).
import { MySessionsView } from "@/components/instructor/MySessionsView";
import { getMySessions } from "@/lib/instructor/session-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sesi Saya | RumahAgen" };

export default async function MySessionsPage() {
  await requireArea("instructor");
  const sessions = await getMySessions();
  return <MySessionsView sessions={sessions} />;
}
