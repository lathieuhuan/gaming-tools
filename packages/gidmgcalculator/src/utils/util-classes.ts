type UnknownObject = Record<string | number, unknown>;

export class Object_ {
  static keys<TObject extends UnknownObject = UnknownObject>(obj: TObject): (keyof TObject)[] {
    return Object.keys(obj);
  }

  static forEach<TObject extends UnknownObject = UnknownObject, TKey extends keyof TObject = keyof TObject>(
    obj: TObject,
    callback: (key: TKey, value: TObject[TKey]) => void
  ) {
    for (const key in obj) callback(key as any, obj[key] as any);
  }
}

export class Array_ {
  static truthyList<TObject extends UnknownObject = UnknownObject>(list: Array<TObject | null | undefined>) {
    return {
      pickEach<TKey extends keyof TObject>(key: TKey) {
        return {
          use(callback: (value: TObject[TKey]) => void) {
            for (const item of list) {
              if (item) callback(item[key]);
            }
          },
        };
      },
    };
  }
}

export class CountMap<TKey extends PropertyKey = PropertyKey> {
  private count: Record<TKey, number>;

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
    this.count = initial as Record<TKey, number>;
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
}
