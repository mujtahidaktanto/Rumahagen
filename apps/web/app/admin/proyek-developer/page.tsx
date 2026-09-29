// app/admin/proyek-developer/page.tsx — Proyek Developer (M06). Tab lewat query string (?tab=projects|partners). Direktori pengguna dimuat hanya untuk tab Developer Partner (pemilih Hubungkan Akun).
import { DeveloperProjectAdminView, type DeveloperTab } from "@/components/admin/DeveloperProjectAdminView";
import { getDeveloperPartners, getDeveloperProjects } from "@/lib/admin/developer-admin-data";
import { getUserDirectory } from "@/lib/admin/user-directory-data";
import type { Part } from "@/lib/agent/dashboard-data";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proyek Developer | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminDeveloperProjectPage({ searchParams }: Props) {
  await requireArea("admin");
  const sp = await searchParams;
  const tab: DeveloperTab = one(sp.tab) === "partners" ? "partners" : "projects";

  const [projects, partners, users] = await Promise.all([
    getDeveloperProjects(),
    getDeveloperPartners(),
    tab === "partners" ? getUserDirectory() : Promise.resolve<Part<DirectoryUserRow[]>>({ ok: true, data: [] }),
  ]);

  return <DeveloperProjectAdminView tab={tab} projects={projects} partners={partners} users={users} />;
}
