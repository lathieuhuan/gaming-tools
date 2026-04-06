export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

/** Helper to check if two types are exactly equal (including readonly) */
export type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? A
  : B;

/** Filter for keys that are NOT readonly */
export type WritableKeys<T> = {
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

/** Filter for keys that are NOT functions */
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T] &
  keyof T;
