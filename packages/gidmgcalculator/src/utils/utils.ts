import type { UserArtifact, UserWeapon } from "@Src/types";
import { ATTACK_ELEMENTS } from "@Src/constants";

export const deepCopy = <T>(item: T): T => JSON.parse(JSON.stringify(item));

export const suffixOf = (stat: string) => {
  return stat.slice(-1) === "_" || ATTACK_ELEMENTS.includes(stat as any) ? "%" : "";
};

export const getImgSrc = (src?: string) => {
  if (import.meta.env.DEV) return "";
  if (!src) return "";
  return src.split("/")[0].length === 1 ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
};

export function pickProps<M, T extends keyof M>(obj: M, keys: T[]) {
  const result = {} as Pick<M, T>;

  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

export const toMult = (n: number) => 1 + n / 100;

export const applyPercent = (n: number, percent: number) => Math.round((n * percent) / 100);

export const toArray = <T>(subject: T | T[]): T[] => (Array.isArray(subject) ? subject : [subject]);

export const applyToOneOrMany = <T>(base: T | T[], callback: (base: T, index?: number) => T) => {
  return Array.isArray(base) ? base.map(callback) : callback(base);
};

const find = (key: string) => {
  return <T>(arr: T[], value?: string | number | null): T | undefined => {
    if (value === undefined) {
      return undefined;
    }
    return arr.find((item) => (item as any)?.[key] === value);
  };
};
const findIndex = (key: string) => {
  return <T>(arr: T[], value: string | number) => arr.findIndex((item) => (item as any)[key] === value);
};

export const findById = find("ID");
export const findByIndex = find("index");
export const findByCode = find("code");
export const findByName = find("name");

export const indexById = findIndex("ID");
export const indexByName = findIndex("name");

export const getAppDataError = (type: "character", code: number | string) => {
  return `Cannot get ${type} config (ERROR_CODE: ${code})`;
};

export const toCustomBuffLabel = (category: string, type: string, t: (origin: string) => string) => {
  return category === "attElmtBonus" ? (type === "phys" ? "physical" : type) : t(type);
};