import { type Ref, useEffect, useRef, useState } from "react";

export const useElementSize = <T extends HTMLElement>(): [Ref<T>, { width: number; height: number }] => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const elmt = ref.current;

    if (elmt) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentBoxSize) {
            const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;

            setSize({
              width: contentBoxSize.inlineSize,
              height: contentBoxSize.blockSize,
            });
          } else {
            setSize({
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
          }
        }
      });

      resizeObserver.observe(elmt);

      return () => {
        resizeObserver.unobserve(elmt);
      };
    }
  }, []);

  return [ref, size];
};
