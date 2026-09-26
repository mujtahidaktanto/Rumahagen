// app/admin/ekonomi-belajar/page.tsx — Ekonomi Pembelajaran (M04): tab lewat query string (?tab=config|catalog|tools).
import { LearningEconomyView } from "@/components/admin/LearningEconomyView";
import { getActiveAgentsForPicker, getCoursesForPicker, getLearningActivities, getLearningEconomyConfigs } from "@/lib/admin/learning-economy-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ekonomi Pembelajaran | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminLearningEconomyPage({ searchParams }: Props) {
  await requireArea("admin");
  const sp = await searchParams;
  const tabParam = one(sp.tab);
  const tab: "config" | "catalog" | "tools" = tabParam === "catalog" ? "catalog" : tabParam === "tools" ? "tools" : "config";

  const [configs, activities] = await Promise.all([getLearningEconomyConfigs(), getLearningActivities()]);
  const [agents, courses] = tab === "tools" ? await Promise.all([getActiveAgentsForPicker(), getCoursesForPicker()]) : [null, null];

  return <LearningEconomyView tab={tab} configs={configs} activities={activities} agents={agents} courses={courses} />;
}
