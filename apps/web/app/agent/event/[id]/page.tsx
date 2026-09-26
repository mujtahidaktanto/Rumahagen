// app/agent/event/[id]/page.tsx — Kelola Event (M05): hanya penyelenggara (pengaju) event; milik orang lain atau tidak ada = "tidak ditemukan".
import type { Route } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/agent/EventForm";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { EventRegistrants } from "@/components/agent/EventRegistrants";
import { getEventFormOptions, getEventRegistrants, getMyEventForEdit } from "@/lib/agent/event-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Event | RumahAgen" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ baru?: string }> };

export default async function ManageEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { baru } = await searchParams;
  const user = await requireArea("agent");
  const [res, options, registrants] = await Promise.all([getMyEventForEdit(user.id, id), getEventFormOptions(), getEventRegistrants(id)]);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
        <ErrorState title="Event gagal dimuat" message="Terjadi gangguan saat memuat event. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/agent/event/${id}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return (
    <EventForm
      key={`${res.event.id}-${res.event.status}`} mode="kelola" eventId={res.event.id} status={res.event.status} initial={res.event.values} options={options} justCreated={baru === "1"}
      extra={<EventRegistrants eventId={res.event.id} registrants={registrants} startIso={res.event.startIso} quota={res.event.quota} approvalMode={res.event.approvalMode} />}
    />
  );
}
