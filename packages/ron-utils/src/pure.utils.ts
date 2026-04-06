export function assertIsError(e: unknown): asserts e is Error {
  if (!(e instanceof Error)) throw new Error("e is not an Error");
}

export const noop = () => {};

export function isFunction<T extends (...args: any[]) => any>(value: any): value is T {
  return typeof value === "function";
}

const numberFormat = new Intl.NumberFormat("en-EN");

export const formatNumber = (n: number) => numberFormat.format(n);

export const round = (n: number, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(n * multiplier) / multiplier;
};

export const toMult = (n: number) => 1 + n / 100;

export const applyPercent = (n: number, percent: number) => Math.round((n * percent) / 100);

export function randomInt(max: number, min = 0, step = 1) {
  return Math.floor((Math.random() * (max - min)) / step) * step + min;
}

export function secondsToTimeString(time: number) {
  const minutes = time >= 60 ? Math.floor(time / 60) : 0;
  const seconds = time - minutes * 60;
  return `${minutes}:${seconds > 9 ? "" : "0"}${seconds}`;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
