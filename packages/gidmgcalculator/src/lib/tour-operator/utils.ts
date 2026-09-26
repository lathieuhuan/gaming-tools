import { Fluent } from "ron-utils";

export function $(id: string) {
  return new Fluent(document.getElementById(id));
}

// class MaybeProperty<T> {
//   constructor(private returned: T) {}

//   get(defaultValue: T, onError?: (error: Error) => void) {
//     if (this.returned == null) {
//       onError?.(new Error("Maybe is null"));
//       return defaultValue;
//     }

//     return this.returned;
//   }
// }

// class MaybeMethod<T> {
//   constructor(
//     private returned: T,
//     private success: boolean,
//   ) {}

//   then<K>(onSuccess: (value: T) => K, onError?: (error: Error) => void): MaybeProperty<K> {
//     let result: K;

//     if (this.success) {
//       result = onSuccess(this.returned);
//     } else {
//       onError?.(new Error("Maybe is null"));
//     }

//     return new MaybeProperty(result);
//   }
// }

// const NULLISH_MEMBER = new Proxy(() => new MaybeMethod<undefined>(undefined, false), {
//   get: (_, prop) => {
//     if (prop === "then") return undefined;

//     if (prop === "get") {
//       return <T>(defaultValue: T, onError?: (error: Error) => void) => {
//         onError?.(new Error("Maybe is null"));
//         return defaultValue;
//       };
//     }

//     return NULLISH_MEMBER;
//   },
//   set: () => true,
// });

// type Fluent<T extends object> = {
//   [K in keyof T]: T[K] extends (...args: infer Args) => infer Returned
//     ? (...args: Args) => MaybeMethod<Returned>
//     : MaybeProperty<T[K]>;
// };

// class FluentCore<T extends object> {
//   private e?: T;

//   constructor(e?: T | null) {
//     this.e = e ?? undefined;

//     return new Proxy(this, {
//       get: (target, prop) => {
//         if (target.e == null) {
//           return NULLISH_MEMBER;
//         }

//         const value: unknown = Reflect.get(target.e, prop, target.e);
//         if (typeof value !== "function") {
//           return new MaybeProperty(value);
//         }

//         return (...args: unknown[]) =>
//           new MaybeMethod(Reflect.apply(value, target.e as object, args), true);
//       },
//       set: (target, prop, value) =>
//         target.e == null ? true : Reflect.set(target.e, prop, value, target.e),
//     });
//   }
// }

// const Fluent = FluentCore as {
//   new <T extends object>(e?: T | null): Fluent<T>;
// };
