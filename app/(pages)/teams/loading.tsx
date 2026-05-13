export default function TeamsLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden">
      <div className="h-10 w-48 rounded-2xl bg-white/5 animate-pulse" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-5 animate-pulse h-28" />
        ))}
      </div>
    </div>
  );
}

