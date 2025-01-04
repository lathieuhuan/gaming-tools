import { useEffect, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  { width: number; height: number }
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const elmt = ref.current;

    if (elmt) {
      const sizeRef = { ...size };

      const updateSize = (width: any, height: any) => {
        if (width !== sizeRef.width || height !== sizeRef.height) {
          sizeRef.width = width;
          sizeRef.height = height;
          setSize({ width, height });
        }
      };

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentBoxSize) {
            const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;

            updateSize(contentBoxSize.inlineSize, contentBoxSize.blockSize);
          } else {
            updateSize(entry.contentRect.width, entry.contentRect.height);
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
}
