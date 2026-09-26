// components/ui/StatusBadge.tsx — lencana status per domain. Teks = nilai CHECK constraint tabel apa adanya (aturan desain: badge status sama persis dengan CHECK); nada warna mengikuti
// Design-System.dc.html. Tambahkan peta domain baru di sini saat modulnya dibangun.
import { Badge, type BadgeTone } from "./Badge";

export const LISTING_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  sold: "info",
  rented: "info",
  expired: "neutral",
  rejected: "danger",
  suspended: "danger",
};

export function ListingStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={LISTING_STATUS_TONE[status] ?? "neutral"} className={className}>
      {status}
    </Badge>
  );
}
