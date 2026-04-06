import type { NonFunctionKeys } from "ron-utils";

export function FlatGetters<
  C extends new (...args: any[]) => object,
  K extends keyof InstanceType<C>
>(key: K, props: NonFunctionKeys<InstanceType<C>[K]>[]) {
  type Props = keyof InstanceType<C>[K];

  return function (
    target: C
    // context: ClassDecoratorContext
  ) {
    // Define getters on the prototype
    for (const prop of props as Props[]) {
      Object.defineProperty(target.prototype, prop, {
        get(this: InstanceType<C>) {
          return this[key][prop];
        },
        enumerable: true,
        configurable: true,
      });
    }
    return target;
  };
}
