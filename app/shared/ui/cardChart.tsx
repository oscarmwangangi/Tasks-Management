export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h2 className="text-lg font-semibold mb-6">
        {title}
      </h2>

      <div className="max-w-87.5 mx-auto">
        {children}
      </div>
    </div>
  );
}