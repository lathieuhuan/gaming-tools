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

export function genSequentialOptions(count: number | undefined = 0, startFrom = 1) {
  return Array.from({ length: count }, (_, i) => {
    const value = i + startFrom;
    return { label: value, value };
  });
}

export function suffixOf(stat: string) {
  return stat.slice(-1) === "_" || ATTACK_ELEMENTS.includes(stat as any) ? "%" : "";
}

export function toCustomBuffLabel(category: string, type: string, t: (origin: string) => string) {
  return category === "attElmtBonus" ? (type === "phys" ? "physical" : type) : t(type);
}

export function secondsToTimeString(time: number) {
  const minutes = time >= 60 ? Math.floor(time / 60) : 0;
  const seconds = time - minutes * 60;
  return `${minutes}:${seconds > 9 ? "" : "0"}${seconds}`;
}
