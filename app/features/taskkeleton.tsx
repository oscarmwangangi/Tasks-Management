// components/TaskPageSkeleton.tsx

export default function TaskPageSkeleton() {
  const columns = Array.from({ length: 5 });
  const tasks = Array.from({ length: 3 });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      {/* Background Glow */}
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-22.5 rounded-xl" />
          <div className="skeleton h-9 w-27.5 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-10 w- rounded-xl" />
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((_, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-6 w-6 rounded-full" />
              </div>
              <div className="skeleton h-4 w-4 rounded" />
            </div>

            {/* Add Task Button */}
            <div className="skeleton h-11 w-full rounded-2xl" />

            {/* Task Cards */}
            <div className="flex flex-col gap-4">
              {tasks.map((_, taskIdx) => (
                <div
                  key={taskIdx}
                  className="rounded-3xl border border-white/5 bg-white/3 p-5"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="skeleton mb-3 h-5 w-3/4 rounded" />
                      <div className="skeleton mb-2 h-3 w-full rounded" />
                      <div className="skeleton h-3 w-2/3 rounded" />
                    </div>
                    <div className="skeleton h-5 w-5 rounded-full shrink-0" />
                  </div>

                  {/* Priority Badge */}
                  <div className="skeleton mb-5 h-6 w-16 rounded-lg" />

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="skeleton h-4 w-9 rounded" />
                      <div className="skeleton h-4 w-7 rounded" />
                    </div>
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}