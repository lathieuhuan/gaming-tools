import { ATTACK_ELEMENTS } from "@Backend";

export function getSearchParam(key: string) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(key);
}

export function getImgSrc(src?: string) {
  const isDevEnv = import.meta.env.DEV;
  // const isDevEnv = false;
  if (isDevEnv || !src) return "";

  const isFromWiki = src.split("/")[0].length === 1;
  return isFromWiki ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
}

export const toMult = (n: number) => 1 + n / 100;

export const applyPercent = (n: number, percent: number) => Math.round((n * percent) / 100);

export function genSequentialOptions(max: number | undefined = 0, startsAt0 = false, min = 1) {
  const result = Array.from({ length: max }, (_, i) => {
    const value = i + min;
    return { label: value, value };
  });
  return startsAt0 ? [{ label: 0, value: 0 }].concat(result) : result;
}

export function suffixOf(stat: string) {
  return stat.slice(-1) === "_" || ATTACK_ELEMENTS.includes(stat as any) ? "%" : "";
}

export function toCustomBuffLabel(category: string, type: string, t: (origin: string) => string) {
  return category === "attElmtBonus" ? (type === "phys" ? "physical" : type) : t(type);
}
