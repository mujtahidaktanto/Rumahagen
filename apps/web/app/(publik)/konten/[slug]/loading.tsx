// app/(publik)/konten/[slug]/loading.tsx — keadaan memuat Detail Konten.
export default function ContentDetailLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat data" className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <div className="flex max-w-3xl flex-col gap-4 py-8">
        <div className="skeleton h-8 w-3/5" />
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-4" />
        <div className="skeleton h-4 w-[90%]" />
        <div className="skeleton h-4 w-[75%]" />
      </div>
      <p className="pb-4 text-center text-caption">Memuat data…</p>
    </div>
  );
}
