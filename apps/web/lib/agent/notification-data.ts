// lib/agent/notification-data.ts — data Pusat Notifikasi (M08), dibaca di server dengan RLS pemanggil dan dibatasi user_id = pengguna (RLS membuka semua baris bagi staf, tetapi ini inbox pribadi).
// Daftar dan jumlah belum dibaca dimuat sendiri-sendiri. Notifikasi yang disembunyikan (dismissed_at) hanya ikut bila diminta.
import { createClient } from "@/lib/supabase/server";
import type { NotificationSearch } from "./notification-rules";

export type CenterNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  createdAt: string;
  isRead: boolean;
  dismissed: boolean;
  deliveryStatus: string;
  entityType: string | null;
  entityId: string | null;
};
export type Part<T> = { ok: true; data: T } | { ok: false };
export type NotificationCenterData = { list: Part<{ items: CenterNotification[]; total: number }>; unread: Part<number> };

type Row = { id: string; type: string; title: string | null; message: string | null; created_at: string; is_read: boolean; dismissed_at: string | null; delivery_status: string; related_entity_type: string | null; related_entity_id: string | null };

export async function getNotificationCenter(userId: string, s: NotificationSearch): Promise<NotificationCenterData> {
  const supabase = await createClient();
  let q = supabase
    .from("notifications")
    .select("id, type, title, message, created_at, is_read, dismissed_at, delivery_status, related_entity_type, related_entity_id", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(0, s.tampil - 1);
  if (s.filter === "belum") q = q.eq("is_read", false);
  if (!s.tersembunyi) q = q.is("dismissed_at", null);

  const [list, unread] = await Promise.all([
    q.returns<Row[]>(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("dismissed_at", null).eq("is_read", false),
  ]);

  return {
    list: list.error
      ? { ok: false }
      : {
          ok: true,
          data: {
            total: list.count ?? (list.data?.length ?? 0),
            items: (list.data ?? []).map((n) => ({
              id: n.id,
              type: n.type,
              title: n.title?.trim() || "Notifikasi",
              message: n.message,
              createdAt: n.created_at,
              isRead: n.is_read,
              dismissed: n.dismissed_at !== null,
              deliveryStatus: n.delivery_status,
              entityType: n.related_entity_type,
              entityId: n.related_entity_id,
            })),
          },
        },
    unread: unread.error ? { ok: false } : { ok: true, data: unread.count ?? 0 },
  };
}
