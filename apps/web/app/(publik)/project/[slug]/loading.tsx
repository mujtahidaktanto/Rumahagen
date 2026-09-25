// app/(publik)/project/[slug]/loading.tsx — keadaan memuat Detail Proyek.
export default function ProjectDetailLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat data" className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <div className="flex flex-col gap-4 py-6">
        <div className="skeleton h-64 rounded-lg sm:h-80 lg:h-[420px]" />
        <div className="skeleton h-8 w-3/5" />
        <div className="skeleton h-4" />
        <div className="skeleton h-4 w-[85%]" />
      </div>
      <p className="pb-4 text-center text-caption">Memuat data…</p>
    </div>
  );
}
