// app/(publik)/learning/loading.tsx — keadaan memuat Daftar Course (kerangka kartu).
export default function LearningLoading() {
  return (
    <div role="status" aria-label="Memuat course">
      <div className="bg-blue-50 py-10">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <div className="skeleton h-9 w-48" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-5 px-4 py-6 min-[560px]:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:px-10">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-40" />
        ))}
      </div>
    </div>
  );
}
