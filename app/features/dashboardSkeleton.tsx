export default function DashboardSkeleton() {
  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .skeleton {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
        }

        .skeleton::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }

        .float {
          animation: float 4s ease-in-out infinite;
        }

        .glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="h-10 w-10 skeleton rounded-xl border border-white/10 glow" />

          <div className="h-10 w-32 rounded-xl border border-blue-500/20 bg-blue-500/10 skeleton" />
        </header>

        {/* Title Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="h-9 w-52 skeleton rounded-xl mb-3" />
            <div className="h-4 w-64 skeleton rounded-md" />
          </div>

          <div className="h-12 w-40 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 skeleton" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative h-36 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden float"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <div className="absolute inset-0 skeleton" />

              <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 skeleton rounded-md" />
                  <div className="h-10 w-10 rounded-2xl skeleton" />
                </div>

                <div>
                  <div className="h-8 w-20 skeleton rounded-lg mb-2" />
                  <div className="h-3 w-28 skeleton rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="relative h-[400px] rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <div className="absolute inset-0 skeleton" />

              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="h-52 w-52 rounded-full border-[14px] border-white/10 border-t-blue-500/30 animate-spin" />

                <div className="mt-8 space-y-3 w-2/3">
                  <div className="h-4 skeleton rounded-md" />
                  <div className="h-4 w-5/6 skeleton rounded-md" />
                  <div className="h-4 w-4/6 skeleton rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between">
            <div className="h-6 w-36 skeleton rounded-lg" />
            <div className="h-5 w-20 skeleton rounded-md" />
          </div>

          <div className="p-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="h-12 w-12 rounded-2xl skeleton" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 skeleton rounded-md" />
                  <div className="h-3 w-1/3 skeleton rounded-md" />
                </div>

                <div className="h-10 w-20 rounded-xl skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}