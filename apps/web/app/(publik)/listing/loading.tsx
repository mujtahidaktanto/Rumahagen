// app/(publik)/listing/loading.tsx — keadaan memuat Discovery (6 kartu kerangka, sesuai wireframe).
export default function ListingLoading() {
  return (
    <div role="status" aria-label="Memuat hasil pencarian" className="bg-surface">
      <div className="border-b border-ink-100 bg-white py-5">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <div className="skeleton mb-3.5 h-10 w-72 max-w-full" />
          <div className="skeleton h-11" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] items-start gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[264px_1fr] xl:px-10">
        <div className="skeleton hidden h-[560px] lg:block" />
        <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-70" />
          ))}
        </div>
      </div>
    </div>
  );
}
