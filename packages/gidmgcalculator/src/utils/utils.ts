import type { Level } from "@Src/types";

export const getBareLv = (level: Level): number => +level.split("/")[0];

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

export const toArray = <T>(subject: T | T[]): T[] => (Array.isArray(subject) ? subject : [subject]);

export const round = (n: number, x: number) => {
  const pow = Math.pow(10, x);
  return Math.round(n * pow) / pow;
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
