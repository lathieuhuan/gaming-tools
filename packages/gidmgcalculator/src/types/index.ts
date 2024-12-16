export * from "./global.types";
export * from "./calculator.types";
export * from "./simulator.types";
export * from "./user-entity.types";

export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}
