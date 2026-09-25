// app/(publik)/konten/loading.tsx — keadaan memuat Konten Publik (6 kartu kerangka).
export default function ContentLoading() {
  return (
    <div role="status" aria-label="Memuat konten">
      <div className="bg-blue-50 py-10">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <div className="skeleton h-9 w-80 max-w-full" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-5 px-4 py-6 min-[560px]:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:px-10">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-35" />
        ))}
      </div>
    </div>
  );
}
