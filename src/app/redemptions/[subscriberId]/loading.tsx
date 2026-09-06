export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-4 pb-24 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="h-8 w-48 bg-[#e4ede9] rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-[#e4ede9] rounded mt-2 animate-pulse" />
        </div>

        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#e4ede9] rounded-2xl px-5 py-4 animate-pulse"
            >
              <div className="h-4 w-40 bg-[#e4ede9] rounded mb-2" />
              <div className="h-3 w-28 bg-[#e4ede9] rounded mb-2" />
              <div className="h-3 w-48 bg-[#e4ede9] rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
