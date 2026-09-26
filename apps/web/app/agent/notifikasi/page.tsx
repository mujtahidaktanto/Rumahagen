// app/agent/notifikasi/page.tsx — Pusat Notifikasi (M08) untuk area agent. Filter dan "Muat Lebih Banyak" lewat URL (?filter=&tampil=&tersembunyi=); data di lib/agent/notification-data.ts.
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getNotificationCenter } from "@/lib/agent/notification-data";
import { parseNotificationSearch } from "@/lib/agent/notification-rules";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifikasi | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NotificationsPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const search = parseNotificationSearch(await searchParams);
  return <NotificationCenter data={await getNotificationCenter(user.id, search)} search={search} area="agent" />;
}
