// app/instructor/kursus/[id]/kuis/[quizId]/page.tsx — Editor Kuis (M04, Fase 6). Tidak ada pengecekan kepemilikan terpisah: RLS quizzes_select/quiz_questions_select/
// quiz_options_select (scope own instruktur, migration 0060) sudah menolak baris kuis milik kursus orang lain — getQuizEditorData gagal {ok:false} dan halaman notFound().
import { notFound } from "next/navigation";
import { QuizEditorView } from "@/components/instructor/QuizEditorView";
import { getQuizEditorData } from "@/lib/instructor/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editor Kuis | RumahAgen" };

type Props = { params: Promise<{ id: string; quizId: string }> };

export default async function InstructorQuizEditorPage({ params }: Props) {
  await requireArea("instructor");
  const { quizId } = await params;
  const data = await getQuizEditorData(quizId);
  if (!data.ok) notFound();
  return <QuizEditorView data={data.data} />;
}
