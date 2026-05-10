export function PriorityBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="px-3 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/20">
      {value}
    </span>
  );
}
