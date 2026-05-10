export function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
      {value}
    </span>
  );
}