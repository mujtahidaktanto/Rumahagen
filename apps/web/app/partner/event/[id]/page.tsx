// app/partner/event/[id]/page.tsx — Ubah pengajuan event (M05, Fase 6). getMyEventForEdit DIPAKAI ULANG dari lib/agent/event-data.ts (murni per userId).
import { notFound } from "next/navigation";
import { PartnerEventForm } from "@/components/partner/PartnerEventForm";
import { getMyEventForEdit } from "@/lib/partner/event-data";
import { getMyProjectOptions } from "@/lib/partner/marketing-kit-data";
import { ErrorState } from "@/components/ui/States";
import { requireArea } from "@/lib/auth/session";
import type { Part } from "@/lib/agent/dashboard-data";
import type { ProjectOption } from "@/lib/partner/marketing-kit-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ubah Pengajuan Event | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPartnerEventPage({ params }: Props) {
  const user = await requireArea("partner");
  const { id } = await params;
  const result = await getMyEventForEdit(user.id, id);

  if (result.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
        <ErrorState title="Event gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }
  if (result.state === "not_found") notFound();

  const projects: Part<ProjectOption[]> = { ok: true, data: await getMyProjectOptions(user.id) };
  return <PartnerEventForm mode="ubah" eventId={result.event.id} status={result.event.status} initial={result.event.values} projects={projects} />;
}
