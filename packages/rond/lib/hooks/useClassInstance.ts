import { MutableRefObject, useRef } from "react";

export function useClassInstance<T, Args extends unknown[]>(
  Constructor: new (...args: Args) => T,
  args: Args,
  ref?: MutableRefObject<T | null>
) {
  const innerRef = useRef<T | null>(null);

  if (!innerRef.current) {
    innerRef.current = new Constructor(...args);

    if (ref) {
      ref.current = innerRef.current;
    }
  }

  return innerRef.current;
}
