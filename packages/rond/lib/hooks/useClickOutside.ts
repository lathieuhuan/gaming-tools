import { useEffect, useRef } from "react";

export type ClickOutsideHandler = (target: HTMLElement) => void;

export function useClickOutside<T extends HTMLElement>(handler: ClickOutsideHandler) {
  const ref = useRef<T>();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && !ref.current?.contains(e.target)) {
        handler(e.target);
      }
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  return ref;
}
