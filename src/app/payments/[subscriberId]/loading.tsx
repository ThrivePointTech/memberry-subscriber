export default function PaymentsLoading() {
  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-4 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Page header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-[#e4ede9] rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-[#e4ede9] rounded animate-pulse" />
        </div>

        {/* Payment row skeletons */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#e4ede9] rounded-2xl px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="h-4 w-28 bg-[#e4ede9] rounded animate-pulse" />
                <div className="h-4 w-16 bg-[#e4ede9] rounded animate-pulse" />
              </div>
              <div className="h-3.5 w-36 bg-[#e4ede9] rounded animate-pulse mb-1" />
              <div className="h-3.5 w-24 bg-[#e4ede9] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
