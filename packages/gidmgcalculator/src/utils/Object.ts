import { DeepPartial } from "@reduxjs/toolkit";
import { deepMerge } from "./pure-utils";
import type { UnknownObject } from "./utils.types";

function isEmpty(value: unknown): boolean {
  return value === "" || value === null || value === undefined;
}

export default class Object_ {
  //
  static set<TObj, const TPath extends NestedPath<TObj>>(
    object: TObj,
    path: TPath,
    value: NestedValue<TObj, TPath>
  ) {
    if (!path.length || !Object_.isObject(object) || Object_.isEmpty(object)) {
      return object;
    }

    const [first, ...rest] = path;
    const target = object as any;

    if (target[first]) {
      // @ts-expect-error - Type is excessively deep
      target[first] = rest.length ? Object_.set(target[first], rest, value) : value;
    }

    return object;
  }

  static isObject(value: unknown): value is object {
    return typeof value === "object" && value !== null;
  }

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

  static assign<TObj extends UnknownObject>(obj: TObj, props: Partial<TObj>): TObj {
    return Object.assign(obj, props);
  }

  static deepMerge<TObj extends UnknownObject>(obj: TObj, ...changes: DeepPartial<TObj>[]): TObj {
    return deepMerge(obj, ...changes) as TObj;
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

type NestedPath<TObj> = TObj extends Array<infer TItem>
  ? [number] | [number, ...NestedPath<TItem>]
  : TObj extends Primitive // Block primitive here or it would access to methods of Number, String, etc.
  ? never
  : TObj extends Record<infer TKey, unknown>
  ? [TKey] | [TKey, ...NestedPath<TObj[TKey]>]
  : never;

type Primitive = string | number | boolean | null | undefined;

type NestedValue<TObj, TPath> = TObj extends Array<infer TItem>
  ? TPath extends [number, ...infer TSubPath1]
    ? TSubPath1 extends []
      ? TItem
      : NestedValue<TItem, TSubPath1>
    : never
  : TObj extends Primitive
  ? TObj
  : TPath extends [infer TKey extends keyof TObj, ...infer TSubPath2]
  ? TSubPath2 extends []
    ? TObj[TKey]
    : NestedValue<TObj[TKey], TSubPath2>
  : never;
