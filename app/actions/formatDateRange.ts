export function formatDateRange(start: Date, end: Date) {
  const s = new Date(start);
  const e = new Date(end);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  return `${s.toLocaleDateString(
    "en-US",
    options
  )} - ${e.toLocaleDateString("en-US", options)}`;
}