// app/admin/konfigurasi/page.tsx — Konfigurasi Sistem (M09). Tab lewat query string (?tab=system|seo|kuota). Superadmin-only untuk mengubah; Admin/Manager melihat "Akses Ditolak".
import { SystemConfigView, type ConfigTab } from "@/components/admin/SystemConfigView";
import { getSeoConfig, getSystemConfigs } from "@/lib/admin/system-config-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Konfigurasi Sistem | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminSystemConfigPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const canManage = user.role === "superadmin";
  const sp = await searchParams;
  const t = one(sp.tab);
  const tab: ConfigTab = t === "seo" ? "seo" : t === "kuota" ? "kuota" : "system";

  const [configs, seo] = await Promise.all([getSystemConfigs(), getSeoConfig()]);

  return <SystemConfigView tab={tab} canManage={canManage} configs={configs} seo={seo} />;
}
