export type CountMapOptions = {
  min?: number;
};

export class CountMap<K extends PropertyKey = string> extends Map<K, number> {
  private readonly min: number;

  /**
   * @param options Default `min` is 0
   */
  constructor(iterable?: Iterable<readonly [K, number]> | null, options?: CountMapOptions);
  constructor(entries?: readonly (readonly [K, number])[] | null, options?: CountMapOptions);
  constructor(
    entries?: Iterable<readonly [K, number]> | readonly (readonly [K, number])[] | null,
    options: CountMapOptions = {},
  ) {
    super();

    const { min = 0 } = options;

    this.min = min;

    if (entries) {
      for (const [key, value] of entries) {
        if (typeof value === "number") {
          this.set(key, value);
        }
      }
    }
  }

  private _get(key: K) {
    return super.get(key) || 0;
  }

  override get(key: K | K[]) {
    if (Array.isArray(key)) {
      return key.reduce((total, key) => total + this._get(key), 0);
    }

    return this._get(key);
  }

  override set(key: K, value: number) {
    if (value > this.min) {
      return super.set(key, value);
    }

    return this;
  }

  /**
   * @returns new count if > min, undefined otherwise
   */
  add(key: K, value = 1) {
    const newValue = this._get(key) + value;

    if (newValue > this.min) {
      this.set(key, newValue);
      return newValue;
    }

    this.delete(key);
    return undefined;
  }

  clone() {
    return new CountMap<K>(this.entries(), {
      min: this.min,
    });
  }
}
