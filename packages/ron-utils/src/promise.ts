export function timeoutPromise<T>(timeout: number, defaultValue: T): PromiseWithResolvers<T>;

export function timeoutPromise<T>(timeout: number): PromiseWithResolvers<T | undefined>;

export function timeoutPromise<T>(timeout: number, defaultValue?: T): PromiseWithResolvers<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  let timeoutId: NodeJS.Timeout | undefined = undefined;

  timeoutId = setTimeout(() => {
    resolve(defaultValue as T);
  }, timeout);

  return {
    promise,
    resolve: (value) => {
      clearTimeout(timeoutId);
      return resolve(value);
    },
    reject,
  };
}
