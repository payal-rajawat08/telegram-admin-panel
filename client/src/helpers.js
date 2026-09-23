export function fmtTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleString();
}
