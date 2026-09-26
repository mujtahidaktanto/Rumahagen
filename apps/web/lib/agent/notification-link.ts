// lib/agent/notification-link.ts — tujuan klik notifikasi menurut entitas terkait (kolom related_entity_type/related_entity_id). Entitas tanpa layar tujuan (award, klaim proyek) = tanpa tautan
// (notifikasi tetap bisa ditandai dibaca). Tujuan hanya rute yang sudah ada.
export function notificationHref(entityType: string | null | undefined, entityId: string | null | undefined, area: "agent" | "instructor" | "partner" | "admin" = "agent"): string | null {
  const id = entityId ?? "";
  switch (entityType) {
    // Rute publik: berlaku untuk semua persona.
    case "event":
      return id ? `/event/${id}` : null;
    case "learning_session":
      return id ? `/learning-session/${id}` : null;
    // Rute area Agent: hanya untuk persona Agent (tipe yang sama bisa dikirim ke persona lain, mis. klaim masuk untuk developer, sehingga tanpa tautan).
    case "listing":
      return area === "agent" && id ? `/agent/listing/${id}` : null;
    case "certificate":
      return area === "agent" ? "/agent/belajar" : null;
    case "organization":
    case "organization_invitation":
      return area === "agent" ? "/agent/organisasi" : null;
    case "project_claim":
      return area === "agent" ? "/agent/klaim" : null;
    default:
      return null;
  }
}

/** Lencana jumlah belum dibaca: "" bila 0, "99+" bila lebih dari 99. */
export function unreadBadge(n: number): string {
  return n <= 0 ? "" : n > 99 ? "99+" : String(n);
}
