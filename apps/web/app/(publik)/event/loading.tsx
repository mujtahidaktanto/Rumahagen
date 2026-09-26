// app/(publik)/event/loading.tsx — keadaan memuat Daftar Event (kerangka kartu).
export default function EventListLoading() {
  return (
    <div role="status" aria-label="Memuat daftar event" className="bg-surface">
      <div className="border-b border-ink-100 bg-white py-5">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <div className="skeleton mb-3.5 h-10 w-72 max-w-full" />
          <div className="skeleton h-11" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-5 px-4 py-7 sm:px-6 lg:grid-cols-2 xl:px-10">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-36" />
        ))}
      </div>
    </div>
  );
}
