export function StatsCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="group rounded-3xl border border-white/5 bg-white/3 p-5 transition-all hover:border-emerald-500/20 hover:bg-white/5 hover:shadow-xl hover:shadow-black/20 ">
      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-3">
        {value}
      </h2>
    </div>
  );
}