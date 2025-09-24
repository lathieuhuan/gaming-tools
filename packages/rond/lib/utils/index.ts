import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./notification";
export * from "./message";
export * from "./bottomList";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round = (n: number, x: number) => {
  const pow = Math.pow(10, x);
  return Math.round(n * pow) / pow;
};
