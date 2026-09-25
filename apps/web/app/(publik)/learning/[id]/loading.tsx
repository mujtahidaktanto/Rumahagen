// app/(publik)/learning/[id]/loading.tsx — keadaan memuat Detail Course.
export default function CourseDetailLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat data" className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <div className="grid gap-8 py-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-8 w-3/5" />
          <div className="skeleton h-4" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-40" />
        </div>
        <div className="skeleton h-44 rounded-lg" />
      </div>
      <p className="pb-4 text-center text-caption">Memuat data…</p>
    </div>
  );
}
