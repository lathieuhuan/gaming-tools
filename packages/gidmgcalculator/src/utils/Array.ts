import Object_ from "./Object";
import type { UnknownObject } from "./utils.types";

function find(key: string) {
  return <T>(arr?: T[], value?: string | number | null): T | undefined => {
    if (value === undefined) {
      return undefined;
    }
    return arr?.find((item) => (item as any)?.[key] === value);
  };
}

function findIndex(key: string) {
  return <T>(arr: T[], value: string | number) =>
    arr.findIndex((item) => (item as any)[key] === value);
}

export default class Array_ {
  static applyToItem<T>(base: T | T[], callback: (base: T, index?: number) => T) {
    return Array.isArray(base) ? base.map(callback) : callback(base);
  }

  static truthify<TObject extends UnknownObject = UnknownObject>(
    list: Array<TObject | null | undefined> | null = []
  ) {
    return list ? (list.filter((item) => !Object_.isNil(item)) as TObject[]) : [];
  }

  static toArray<T>(subject: T | T[]): T[] {
    return Array.isArray(subject) ? subject : [subject];
  }

  static isEqual(a: unknown[], b: unknown[]) {
    return a.length === b.length && a.every((item, i) => item === b[i]);
  }

  static sync<T extends object, K>(target: T[], source: T[], key: keyof T | ((obj: T) => K)) {
    const keyFn = typeof key === "function" ? key : (obj: T) => obj[key];

    const sourceMap = new Map<K | T[keyof T], T>();
    const syncedMap = new Map<K | T[keyof T], T>();

    for (const obj of source) {
      sourceMap.set(keyFn(obj), obj);
    }

    for (const obj of target) {
      const key = keyFn(obj);

      if (sourceMap.has(key)) {
        syncedMap.set(key, obj);
      }
    }

    for (const obj of sourceMap.values()) {
      if (!syncedMap.has(keyFn(obj))) {
        syncedMap.set(keyFn(obj), obj);
      }
    }

    return Array.from(syncedMap.values());
  }

  static findById = find("ID");
  static findByIndex = find("index");
  static findByCode = find("code");
  static findByName = find("name");
  static indexById = findIndex("ID");
  static indexByName = findIndex("name");
}
