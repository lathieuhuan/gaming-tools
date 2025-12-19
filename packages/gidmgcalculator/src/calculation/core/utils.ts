export function limitCRate(crit: number) {
  return Math.min(Math.max(crit, 0), 100);
}
