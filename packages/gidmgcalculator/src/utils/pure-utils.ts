import { ATTACK_ELEMENTS } from "@Calculation";
import { IS_DEV_ENV } from "@/constants";

export function getImgSrc(src?: string) {
  // const IS_DEV_ENV = false;
  if (IS_DEV_ENV || !src) return "";

  const isFromWiki = src.split("/")[0].length === 1;
  return isFromWiki ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
}

const numberFormat = new Intl.NumberFormat("en-EN");

export const formatNumber = (n: number) => numberFormat.format(n);

export const toMult = (n: number) => 1 + n / 100;

export const applyPercent = (n: number, percent: number) => Math.round((n * percent) / 100);

export function randomInt(max: number, min = 0, step = 1) {
  return Math.floor((Math.random() * (max - min)) / step) * step + min;
}

export function genNumberSequence(count: number, startFrom = 1) {
  return [...Array(count)].map((_, i) => i + startFrom);
}

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
