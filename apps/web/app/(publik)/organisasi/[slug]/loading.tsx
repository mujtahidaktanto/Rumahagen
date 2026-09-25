// app/(publik)/organisasi/[slug]/loading.tsx — keadaan memuat Detail Organisasi.
export default function OrganizationDetailLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat data" className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <div className="flex flex-col gap-4 py-6">
        <div className="skeleton h-36 rounded-lg" />
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-4" />
        <div className="skeleton h-4 w-4/5" />
      </div>
      <p className="pb-4 text-center text-caption">Memuat data…</p>
    </div>
  );
}
