import { isFunction } from "./pure.utils";

// 1. Helper to check if two types are exactly equal (including readonly)
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B;

// 2. Filter for keys that are NOT readonly
type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    {
      [Q in P]: T[P];
    },
    {
      -readonly [Q in P]: T[P];
    },
    P,
    never
  >;
}[keyof T];

// 3. Filter for keys that are NOT functions
type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T] &
  keyof T;

// 4. Filter for keys that ARE functions
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer V ? (V extends void ? K : never) : never;
}[keyof T];

// 5. Map functions to return the parent $El instance instead of their original return type
type Act<T, Parent> = {
  [K in FunctionKeys<T>]: T[K] extends (...args: infer Args) => infer V
    ? V extends void
      ? (...args: Args) => Parent
      : never
    : never;
};

export class Fluent<T> {
  private e?: T;

  constructor(e?: T | null) {
    this.e = e ?? undefined;
  }

  get this() {
    return this.e;
  }

  get act(): Act<T, this> {
    return new Proxy({} as any, {
      get: (_, prop) => {
        return (...args: any[]) => {
          const func = (this.e as any)?.[prop];

          if (isFunction(func)) {
            // Ensure the function is bound to the original element
            func.apply(this.e, args);
          }

          return this;
        };
      },
    }) as Act<T, this>;
  }

  set<K extends WritableKeys<T> & NonFunctionKeys<T>>(key: K, value: T[K] | ((e: T) => T[K])): this;

  set(key: keyof T, value: any): this {
    if (this.e) {
      const newValue = typeof value === "function" ? value(this.e) : value;

      Object.assign(this.e, { [key]: newValue });
    }

    return this;
  }

  get<K extends NonFunctionKeys<T>>(key: K): Fluent<Exclude<T[K], null>> {
    const value = this.e?.[key] ?? undefined;
    return new Fluent(value as Exclude<T[K], null> | undefined);
  }

  do(callback: (e: T) => void) {
    if (this.e) {
      callback(this.e);
    }

    return this;
  }
}
