export function cssVar(x: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(x).trim();
}
