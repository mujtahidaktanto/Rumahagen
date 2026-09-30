// app/partner/event/page.tsx — Event (Ajukan Event Mitra, M05, Fase 6).
import { MyEventsView } from "@/components/partner/MyEventsView";
import { getMySubmittedEvents } from "@/lib/partner/event-data";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { requireArea } from "@/lib/auth/session";
import type { Part } from "@/lib/agent/dashboard-data";
import type { MySubmittedEvent } from "@/lib/partner/event-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event | RumahAgen" };

export default async function PartnerEventsPage() {
  const user = await requireArea("partner");
  const profile = await getMyPartnerProfile(user.id);
  const linked = profile.ok && !!profile.data;
  const events: Part<MySubmittedEvent[]> = linked ? await getMySubmittedEvents(user.id) : { ok: true, data: [] };
  return <MyEventsView linked={linked} events={events} />;
}
