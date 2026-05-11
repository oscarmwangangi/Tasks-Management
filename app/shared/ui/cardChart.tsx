export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group rounded-3xl border border-white/5 bg-white/3 p-5 transition-all hover:border-emerald-500/20 hover:bg-white/5 hover:shadow-xl hover:shadow-black/20 ">
      <h2 className="text-lg font-semibold mb-6">
        {title}
      </h2>

      <div className="max-w-87.5 mx-auto">
        {children}
      </div>
    </div>
  );
}