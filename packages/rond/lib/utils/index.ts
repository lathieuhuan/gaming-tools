export * from "./notification";
export * from "./message";
export * from "./bottomList";

export const round = (n: number, x: number) => {
  const pow = Math.pow(10, x);
  return Math.round(n * pow) / pow;
};
