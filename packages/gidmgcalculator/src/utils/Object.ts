import type { UnknownObject } from "./utils.types";

function isEmpty(value: unknown): boolean {
  return value === "" || value === null || value === undefined;
}

export default class Object_ {
  //
  static isNil(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  static isEmpty(value?: object | null): boolean {
    return this.isNil(value) || !Object.keys(value).length;
  }

  static isNotEmpty(value?: object | null): value is object {
    return !this.isEmpty(value);
  }

  static keys<TObject extends UnknownObject = UnknownObject>(obj: TObject): (keyof TObject)[] {
    return Object.keys(obj);
  }

  static entries<TObject extends object>(obj: TObject): [keyof TObject, TObject[keyof TObject]][] {
    return Object.entries(obj) as [keyof TObject, TObject[keyof TObject]][];
  }

  static forEach<
    TObject extends UnknownObject = UnknownObject,
    TKey extends keyof TObject = keyof TObject
  >(obj: TObject, callback: (key: TKey, value: TObject[TKey]) => void) {
    for (const key in obj) {
      callback(key as unknown as TKey, obj[key] as unknown as TObject[TKey]);
    }
  }

  static pickProps<TObject, TKey extends keyof TObject = keyof TObject>(
    obj: TObject,
    keys: TKey[]
  ) {
    const result = {} as Pick<TObject, TKey>;

    for (const key of keys) {
      result[key] = obj[key];
    }

    return result;
  }

  static omitEmptyProps<T>(object: T, filterKey: (key: string) => boolean = () => true): T {
    if (Array.isArray(object)) {
      if (!object.length) {
        return object;
      }
      const clone = [];

      for (const item of object) {
        const processedItem = Object_.omitEmptyProps(item, filterKey);
        if (!isEmpty(processedItem)) clone.push(processedItem);
      }

      return clone as unknown as T;
    }
    if (typeof object === "object" && object !== null) {
      const keys = Object.keys(object).filter(filterKey);

      if (!keys.length) {
        return {} as T;
      }
      const clone: any = {};

      for (const key of keys) {
        const value = Object_.omitEmptyProps(object[key as keyof typeof object], filterKey);
        if (!isEmpty(value)) clone[key] = value;
      }

      return clone as unknown as T;
    }

    return object;
  }

  static assign<TObj extends Record<PropertyKey, unknown>>(obj: TObj, props: Partial<TObj>): TObj {
    return Object.assign(obj, props);
  }

  static optionalAssign<TObj extends object>(obj: TObj, props: Partial<TObj>): TObj {
    const result = obj;

    for (const [key, value] of Object_.entries(props)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  static clone<T>(item: T): T {
    try {
      return structuredClone(item);
    } catch {
      return JSON.parse(JSON.stringify(item));
    }
  }
}
