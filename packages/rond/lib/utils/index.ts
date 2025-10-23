import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export * from "./notification";
export * from "./message";
export * from "./bottomList";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "dark-0",
        "dark-1",
        "dark-2",
        "dark-3",
        "dark-line",
        "light-0",
        "light-1",
        "light-2",
        "light-3",
        "light-4",
        "light-hint",
        "danger-1",
        "danger-2",
        "primary-1",
        "primary-2",
        "secondary-1",
        "active",
        "bonus",
        "link",
        "rarity-5",
        "rarity-4",
        "rarity-3",
        "rarity-2",
        "rarity-1",
        "table-row-hover",
        "heading",
      ],
      text: ["1.5xl", "xlp"],
      radius: ["circle", "2.5xl"],
      shadow: ["common", "dropdown", "popup", "hightlight-1", "hightlight-2"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round = (n: number, x: number) => {
  const pow = Math.pow(10, x);
  return Math.round(n * pow) / pow;
};
