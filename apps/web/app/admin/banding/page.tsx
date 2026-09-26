// app/admin/banding/page.tsx — Banding Penghargaan (M15).
import { AwardAppealView } from "@/components/admin/AwardAppealView";
import { getAwardAppeals } from "@/lib/admin/award-appeal-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Banding Penghargaan | RumahAgen" };

export default async function AdminAwardAppealPage() {
  const user = await requireArea("admin");
  const appeals = await getAwardAppeals();
  return <AwardAppealView viewerRole={user.role as AdminViewerRole} appeals={appeals} />;
}
