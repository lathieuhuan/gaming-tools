export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type PartiallyRequiredOnly<T, K extends keyof T> = PartiallyRequired<Partial<T>, K>;

export type RequiredPick<TObject, TRequiredKeys extends keyof TObject> = Required<Pick<TObject, TRequiredKeys>>;

export type PartialPick<TObject, TPartialKeys extends keyof TObject> = Partial<Pick<TObject, TPartialKeys>>;

export type AdvancedPick<
  TObject,
  TRequiredKeys extends keyof TObject,
  TPartialKeys extends Exclude<keyof TObject, TRequiredKeys>
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
