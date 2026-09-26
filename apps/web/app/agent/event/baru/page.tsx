// app/agent/event/baru/page.tsx — Ajukan Event (M05). Pilihan "Terkait" (course tayang, proyek developer) dimuat di server.
import { EventForm } from "@/components/agent/EventForm";
import { getEventFormOptions } from "@/lib/agent/event-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ajukan Event | RumahAgen" };

export default async function NewEventPage() {
  await requireArea("agent");
  return <EventForm mode="baru" options={await getEventFormOptions()} />;
}
