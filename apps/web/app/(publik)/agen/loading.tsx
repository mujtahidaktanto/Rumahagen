// app/(publik)/agen/loading.tsx — keadaan memuat Daftar Agen (kerangka kartu).
export default function AgentListLoading() {
  return (
    <div role="status" aria-label="Memuat daftar agen" className="bg-surface">
      <div className="border-b border-ink-100 bg-white py-5">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <div className="skeleton mb-3.5 h-10 w-72 max-w-full" />
          <div className="skeleton h-11" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-5 px-4 py-7 min-[520px]:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4 xl:px-10">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-44" />
        ))}
      </div>
    </div>
  );
}
