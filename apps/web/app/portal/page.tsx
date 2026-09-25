// app/portal/page.tsx — titik masuk setelah login: mengalihkan ke beranda area sesuai peran (agent -> /agent, admin/manager -> /admin, dst.). Belum login -> /login.
import type { Route } from "next";
import { redirect } from "next/navigation";
import { homePathOf } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";

export default async function PortalPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status !== "active") redirect("/login?alasan=dibatasi");
  redirect(homePathOf(user.role) as Route);
}
