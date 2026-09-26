// app/agent/organisasi/baru/page.tsx — Buat Organisasi (M12).
import { OrgCreateForm } from "@/components/agent/OrgCreateForm";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Organisasi | RumahAgen" };

export default async function NewOrganizationPage() {
  await requireArea("agent");
  return <OrgCreateForm />;
}
