import { useEffect, useRef } from "react";

export function useChildListObserver<T extends HTMLElement = HTMLDivElement>(options: {
  onNodesAdded?: (addedList: NodeList) => void;
  onNodesRemoved?: (removedList: NodeList) => void;
}) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (containerRef.current) {
      const mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          options.onNodesAdded?.(record.addedNodes);
          options.onNodesRemoved?.(record.removedNodes);
        }
      });

      mutationObserver.observe(containerRef.current, { childList: true });

      return () => mutationObserver.disconnect();
    }
  }, []);

  return { observedAreaRef: containerRef };
}
