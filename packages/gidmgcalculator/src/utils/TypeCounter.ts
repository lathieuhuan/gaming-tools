import { Object_ } from "ron-utils";

type TypeCounterOptions = {
  allowNegative?: boolean;
};

/**
 * Map<Key, number> with a minimum value:
 * - key with value less than min will be removed.
 * - Get value will return 0 if the key is not present.
 * - Default min = 0. If allowNegative, min = -Infinity.
 */

export default class TypeCounter<TKey extends PropertyKey = PropertyKey> {
  private count = new Map<TKey, number>();
  private min: number;

  /** Only keys with positive count */
  get keys() {
    return Array.from(this.count.keys());
  }

  get entries() {
    return Array.from(this.count.entries());
  }

  constructor(
    initial: Partial<Record<TKey, number>> | Map<TKey, number> = {},
    private options: TypeCounterOptions = {}
  ) {
    const min = options.allowNegative ? -Infinity : 0;
    const entries = initial instanceof Map ? initial.entries() : Object_.entries(initial);

    for (const [key, value] of entries) {
      if (typeof value === "number" && value > min) {
        this.count.set(key, value);
      }
    }

    this.min = min;
  }

  private _get(key: TKey) {
    return this.count.get(key) ?? 0;
  }

  has(key: TKey) {
    return this.count.has(key);
  }

  get(keys: TKey | TKey[]) {
    return Array.isArray(keys)
      ? keys.reduce((total, key) => total + this._get(key), 0)
      : this._get(keys);
  }

  add(key: TKey, value = 1) {
    const newCount = this._get(key) + value;

    if (newCount > this.min) {
      this.count.set(key, newCount);
      return newCount;
    }

    this.count.delete(key);
    return undefined;
  }

  remove(key: TKey, value = 1) {
    return this.add(key, -value);
  }

  delete(key: TKey) {
    this.count.delete(key);
    return this;
  }

  /** Only run callback for entries that have value larger than min */
  forEach(callback: (key: TKey, count: number) => void) {
    this.count.forEach((count, key) => {
      callback(key, count);
    });
  }

  clone() {
    return new TypeCounter(this.count, this.options);
  }

  clear() {
    this.count.clear();
    return this;
  }
}

export type TypeCounterKey<T> = T extends TypeCounter<infer TKey> ? TKey : never;
