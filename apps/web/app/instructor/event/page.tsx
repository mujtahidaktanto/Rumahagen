// app/instructor/event/page.tsx — Event Saya (M05, Fase 6).
import { MyEventsView } from "@/components/instructor/MyEventsView";
import { getMySubmittedEvents } from "@/lib/instructor/event-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event Saya | RumahAgen" };

export default async function InstructorEventsPage() {
  const user = await requireArea("instructor");
  return <MyEventsView events={await getMySubmittedEvents(user.id)} />;
}
