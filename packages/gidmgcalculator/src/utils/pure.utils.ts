export const toMult = (n: number) => 1 + n / 100;

export const applyPercent = (n: number, percent: number) => Math.round((n * percent) / 100);

export function genSequentialOptions(count: number | undefined = 0, startFrom = 1) {
  return Array.from({ length: count }, (_, i) => {
    const value = i + startFrom;
    return { label: value, value };
  });
}

export function suffixOf(stat: string) {
  return stat.slice(-1) === "_" ||
    ["pyro", "hydro", "electro", "cryo", "geo", "anemo", "dendro", "phys"].includes(stat)
    ? "%"
    : "";
}

export function toCustomBuffLabel(category: string, type: string, t: (origin: string) => string) {
  return category === "attElmtBonus" ? (type === "phys" ? "physical" : type) : t(type);
}
