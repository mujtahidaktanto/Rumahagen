// app/partner/event/baru/page.tsx — Ajukan Event baru (M05, Fase 6). Redirect ke daftar bila akun belum terhubung (tidak ada perusahaan untuk pemilih proyek).
import { redirect } from "next/navigation";
import { PartnerEventForm } from "@/components/partner/PartnerEventForm";
import { getMyProjectOptions } from "@/lib/partner/marketing-kit-data";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { requireArea } from "@/lib/auth/session";
import type { Part } from "@/lib/agent/dashboard-data";
import type { ProjectOption } from "@/lib/partner/marketing-kit-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ajukan Event | RumahAgen" };

export default async function NewPartnerEventPage() {
  const user = await requireArea("partner");
  const profile = await getMyPartnerProfile(user.id);
  if (!profile.ok || !profile.data) redirect("/partner/event");
  const projects: Part<ProjectOption[]> = { ok: true, data: await getMyProjectOptions(user.id) };
  return <PartnerEventForm mode="baru" projects={projects} />;
}
