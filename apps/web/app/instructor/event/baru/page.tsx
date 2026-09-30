// app/instructor/event/baru/page.tsx — Buat Event (M05, Fase 6). Pilihan "Kursus Terkait" dimuat di server.
import { EventForm } from "@/components/instructor/EventForm";
import { getEventFormOptions } from "@/lib/instructor/event-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Event | RumahAgen" };

export default async function NewInstructorEventPage() {
  await requireArea("instructor");
  return <EventForm mode="baru" options={await getEventFormOptions()} />;
}
