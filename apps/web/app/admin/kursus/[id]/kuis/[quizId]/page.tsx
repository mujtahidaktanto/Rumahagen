// app/admin/kursus/[id]/kuis/[quizId]/page.tsx — Editor Kuis (M04).
import { notFound } from "next/navigation";
import { QuizEditorView } from "@/components/admin/QuizEditorView";
import { getQuizEditorData } from "@/lib/admin/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editor Kuis | RumahAgen" };

type Props = { params: Promise<{ id: string; quizId: string }> };

export default async function AdminQuizEditorPage({ params }: Props) {
  await requireArea("admin");
  const { quizId } = await params;
  const data = await getQuizEditorData(quizId);
  if (!data.ok) notFound();
  return <QuizEditorView data={data.data} />;
}
