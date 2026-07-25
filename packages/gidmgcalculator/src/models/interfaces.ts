export interface Clonable<T> {
  clone(): T;
}

export interface Serializable<T> {
  serialize(): T;
}
