import { useRef } from "react";

export function useOverlayElement(id: string, modify?: (el: HTMLElement) => void) {
  const ref = useRef<HTMLElement | null>(null);

  if (!ref.current) {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement("div");
      element.id = id;
      modify?.(element);
      document.body.append(element);
    }

    ref.current = element;
  }

  return ref.current;
}
