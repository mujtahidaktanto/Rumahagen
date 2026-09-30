// app/admin/konten/page.tsx — Konten & Notifikasi (M09). Tab lewat query string (?tab=banner|konten|template|kirim). Direktori pengguna dimuat hanya untuk tab Kirim (pemilih akun tujuan).
import { ContentNotifView, type ContentTab } from "@/components/admin/ContentNotifView";
import { getBanners, getNotificationTemplates, getStaticContentList } from "@/lib/admin/content-notif-data";
import { getUserDirectory } from "@/lib/admin/user-directory-data";
import type { Part } from "@/lib/agent/dashboard-data";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Konten & Notifikasi | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminContentNotifPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const role = user.role;
  const canManageBanner = role === "superadmin" || role === "admin";
  const canManageTemplate = role === "superadmin" || role === "admin" || role === "manager";
  const canSendManual = role === "superadmin" || role === "admin";
  const canManageContent = role === "superadmin" || role === "admin";

  const sp = await searchParams;
  const t = one(sp.tab);
  const tab: ContentTab = t === "konten" || t === "template" || t === "kirim" ? t : "banner";

  const [banners, templates, users, staticContent] = await Promise.all([
    getBanners(),
    getNotificationTemplates(),
    tab === "kirim" && canSendManual ? getUserDirectory() : Promise.resolve<Part<DirectoryUserRow[]>>({ ok: true, data: [] }),
    getStaticContentList(),
  ]);

  return (
    <ContentNotifView
      tab={tab}
      canManageBanner={canManageBanner}
      canManageTemplate={canManageTemplate}
      canSendManual={canSendManual}
      canManageContent={canManageContent}
      banners={banners}
      templates={templates}
      users={users}
      staticContent={staticContent}
    />
  );
}
