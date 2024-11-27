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
    return structuredClone(this.count);
  }

  constructor(initial: Partial<Record<TKey, number>> = {}) {
    this.initial = structuredClone(initial);
    this.count = structuredClone(this.initial) as Record<TKey, number>;
  }

  private _get = (key: TKey) => {
    return this.count[key] ?? 0;
  };

  has = (key: TKey) => {
    return this._get(key) !== 0;
  };

  get = (keys: TKey | TKey[]) => {
    return Array.isArray(keys) ? keys.reduce((total, key) => total + this._get(key), 0) : this._get(keys);
  };

  add = (key: TKey, value = 1) => {
    return (this.count[key] = this._get(key) + value);
  };

  forEach = (callback: (key: TKey, count: number) => void) => {
    for (const key in this.count) callback(key, this.count[key]);
  };

  reset = () => {
    this.count = structuredClone(this.initial) as Record<TKey, number>;
  };
}
