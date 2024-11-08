import type { UnknownObject } from "./utils.types";

function find(key: string) {
  return <T>(arr: T[], value?: string | number | null): T | undefined => {
    if (value === undefined) {
      return undefined;
    }
    return arr.find((item) => (item as any)?.[key] === value);
  };
}
function findIndex(key: string) {
  return <T>(arr: T[], value: string | number) => arr.findIndex((item) => (item as any)[key] === value);
}

export default class Array_ {
  static applyToItem<T>(base: T | T[], callback: (base: T, index?: number) => T) {
    return Array.isArray(base) ? base.map(callback) : callback(base);
  }

  static truthy<TObject extends UnknownObject = UnknownObject>(list: Array<TObject | null | undefined>) {
    return list.filter(Boolean) as TObject[];
  }

  static truthyOp<TObject extends UnknownObject = UnknownObject>(list: Array<TObject | null | undefined>) {
    return {
      useEach<TKey extends keyof TObject>(key: TKey, callback: (value: TObject[TKey]) => void) {
        for (const item of list) {
          if (item) callback(item[key]);
        }
      },
    };
  }

  static toArray<T>(subject: T | T[]): T[] {
    return Array.isArray(subject) ? subject : [subject];
  }

  static findById = find("ID");
  static findByIndex = find("index");
  static findByCode = find("code");
  static findByName = find("name");
  static indexById = findIndex("ID");
  static indexByName = findIndex("name");
}
