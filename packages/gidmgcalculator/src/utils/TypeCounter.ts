import { Object_ } from "ron-utils";

type TypeCounterOptions = {
  allowNegative?: boolean;
};

export default class TypeCounter<TKey extends PropertyKey = PropertyKey> {
  private count: Record<TKey, number>;
  private initial: Partial<Record<TKey, number>> = {};
  private min: number;

  /** Only keys with positive count */
  get keys() {
    const keys: TKey[] = [];
    for (const key in this.count) {
      if (this.has(key)) keys.push(key);
    }
    return keys;
  }

  get entries() {
    return Object.entries(this.count) as [TKey, number][];
  }

  get result(): {
    readonly [P in TKey]: number;
  } {
    return this.count;
  }

  constructor(
    initial: Partial<Record<TKey, number>> = {},
    private options: TypeCounterOptions = {}
  ) {
    const min = options.allowNegative ? -Infinity : 0;
    const data = this.filter(initial, min);

    this.initial = Object_.cloneProps(data);
    this.count = data;
    this.min = min;
  }

  private filter(data: Partial<Record<TKey, number>>, min = 0) {
    const filtered = {} as Record<TKey, number>;

    for (const key of Object_.keys(data)) {
      const value = data[key];

      if (typeof value === "number" && value > min) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  private _get(key: TKey) {
    return this.count[key] ?? 0;
  }

  has(key: TKey) {
    return !!this.count[key];
  }

  get(keys: TKey | TKey[]) {
    return Array.isArray(keys)
      ? keys.reduce((total, key) => total + this._get(key), 0)
      : this._get(keys);
  }

  add(key: TKey, value = 1) {
    const newCount = this._get(key) + value;

    if (newCount > this.min) {
      this.count[key] = newCount;
    } else {
      delete this.count[key];
    }

    return newCount;
  }

  remove(key: TKey, value = 1) {
    return this.add(key, -value);
  }

  delete(key: TKey) {
    delete this.count[key];
    return this;
  }

  // merge = (data: TypeCounter<TKey> | Partial<Record<TKey, number>>) => {
  //   const _data = data instanceof TypeCounter ? data.result : data;

  //   for (const key in _data) {
  //     this.add(key, _data[key]);
  //   }

  //   return this;
  // };

  /** Only run callback for entries that have value other than 0   */
  forEach(callback: (key: TKey, count: number) => void) {
    Object_.forEach(this.count, (key, count) => {
      if (count) {
        callback(key, count);
      }
    });
  }

  clone() {
    return new TypeCounter(Object_.cloneProps(this.count), this.options);
  }

  reset() {
    this.count = Object_.cloneProps(this.initial) as Record<TKey, number>;
    return this;
  }

  clear() {
    this.count = {} as Record<TKey, number>;
    return this;
  }
}

export type TypeCounterKey<T> = T extends TypeCounter<infer TKey> ? TKey : never;
