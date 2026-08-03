export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type PartiallyRequiredOnly<T, K extends keyof T> = PartiallyRequired<Partial<T>, K>;

export type RequiredPick<TObject, TRequiredKeys extends keyof TObject> = Required<
  Pick<TObject, TRequiredKeys>
>;

export type PartialPick<TObject, TPartialKeys extends keyof TObject> = Partial<
  Pick<TObject, TPartialKeys>
>;

export type ExactOmit<TObject, TOmitKeys extends keyof TObject> = Omit<TObject, TOmitKeys>;

export type AdvancedPick<
  TObject,
  TRequiredKeys extends keyof TObject,
  TPartialKeys extends Exclude<keyof TObject, TRequiredKeys>,
> = RequiredPick<TObject, TRequiredKeys> & PartialPick<TObject, TPartialKeys>;

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function
    ? T
    : T extends object
      ? DeepReadonlyObject<T>
      : T;

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
//   ? I
//   : never;

// // 2. Overloaded functions return the last type variant when inferred
// type LastOfUnion<T> =
//   UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

// // 3. Recursively push the last element of the union into the tuple
// export type UnionToTuple<T, Last = LastOfUnion<T>> = [T] extends [never]
//   ? []
//   : [...UnionToTuple<Exclude<T, Last>>, Last];

// type Tuple = UnionToTuple<"a" | "b" | "c">;

// type TupleToUnion<T extends readonly any[]> = T[number];

// type Union = TupleToUnion<Tuple>;

// type IsUnion<T, U = T> = T extends U
//   ? [U] extends [T]
//     ? false
//     : true
//   : never;
