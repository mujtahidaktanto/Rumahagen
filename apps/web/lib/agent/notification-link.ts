// lib/agent/notification-link.ts — tujuan klik notifikasi menurut entitas terkait (kolom related_entity_type/related_entity_id). Entitas tanpa layar tujuan (award, klaim proyek) = tanpa tautan
// (notifikasi tetap bisa ditandai dibaca). Tujuan hanya rute yang sudah ada.
export function notificationHref(entityType: string | null | undefined, entityId: string | null | undefined): string | null {
  const id = entityId ?? "";
  switch (entityType) {
    case "event":
      return id ? `/event/${id}` : null;
    case "listing":
      return id ? `/agent/listing/${id}` : null;
    case "learning_session":
      return id ? `/learning-session/${id}` : null;
    case "certificate":
      return "/agent/belajar";
    case "organization":
    case "organization_invitation":
      return "/agent/organisasi";
    default:
      return null;
  }
}

/** Lencana jumlah belum dibaca: "" bila 0, "99+" bila lebih dari 99. */
export function unreadBadge(n: number): string {
  return n <= 0 ? "" : n > 99 ? "99+" : String(n);
}
