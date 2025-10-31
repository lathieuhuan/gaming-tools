export default class TypeCounter<TKey extends PropertyKey = PropertyKey> {
  private count: Record<TKey, number>;
  private initial: Partial<Record<TKey, number>> = {};

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

  get result() {
    return { ...this.count };
  }

  constructor(initial: Partial<Record<TKey, number>> = {}) {
    this.initial = { ...initial };
    this.count = { ...this.initial } as Record<TKey, number>;
  }

  private _get = (key: TKey) => {
    return this.count[key] ?? 0;
  };

  has = (key: TKey) => {
    return !!this.count[key];
  };

  get = (keys: TKey | TKey[]) => {
    return Array.isArray(keys)
      ? keys.reduce((total, key) => total + this._get(key), 0)
      : this._get(keys);
  };

  add = (key: TKey, value = 1) => {
    return (this.count[key] = this._get(key) + value);
  };

  merge = (data: TypeCounter<TKey> | Partial<Record<TKey, number>>) => {
    const _data = data instanceof TypeCounter ? data.result : data;

    for (const key in _data) {
      this.add(key, _data[key]);
    }

    return this;
  };

  forEach = (callback: (key: TKey, count: number) => void) => {
    for (const key in this.count) {
      // TOCHECK: not callback when this.count[key] is 0
      callback(key, this.count[key]);
    }
  };

  clear = () => {
    this.count = {} as Record<TKey, number>;
  };

  reset = () => {
    this.count = { ...this.initial } as Record<TKey, number>;
  };
}
