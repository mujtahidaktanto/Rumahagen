// app/agent/event/page.tsx — Event Saya (M05): pendaftaran saya dan event yang saya ajukan. Data dimuat di server (lib/agent/event-data.ts).
import { MyEventsView } from "@/components/agent/MyEventsView";
import { getMyEvents } from "@/lib/agent/event-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event Saya | RumahAgen" };

export default async function AgentEventsPage() {
  const user = await requireArea("agent");
  return <MyEventsView data={await getMyEvents(user.id)} />;
}
