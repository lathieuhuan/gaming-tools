import type { UnknownObject } from "./utils.types";

function isEmpty(value: any): boolean {
  return value === "" || value === null || value === undefined;
}

export default class Object_ {
  static keys<TObject extends UnknownObject = UnknownObject>(obj: TObject): (keyof TObject)[] {
    return Object.keys(obj);
  }

  static forEach<TObject extends UnknownObject = UnknownObject, TKey extends keyof TObject = keyof TObject>(
    obj: TObject,
    callback: (key: TKey, value: TObject[TKey]) => void
  ) {
    for (const key in obj) callback(key as any, obj[key] as any);
  }

  static pickProps<TObject extends UnknownObject = UnknownObject, TKey extends keyof TObject = keyof TObject>(
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

  static clone<T>(item: T): T {
    try {
      return structuredClone(item);
    } catch {
      return JSON.parse(JSON.stringify(item));
    }
  }
}
