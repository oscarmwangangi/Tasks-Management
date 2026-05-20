// Change the parameter types from 'Date' to 'Date | string'
export function formatDateRange(start: Date | string, end: Date | string) {
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