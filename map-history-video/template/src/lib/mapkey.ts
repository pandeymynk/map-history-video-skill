/** Stable id for a map view (same focus + margin → same satellite background image). */
export function viewKey(focus: string[], margin: number): string {
  const s = `${focus.join("|")}@${margin}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
