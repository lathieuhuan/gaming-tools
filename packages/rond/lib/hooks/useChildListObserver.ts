import { useEffect, useRef } from "react";

export function useChildListObserver<T extends HTMLElement = HTMLDivElement>(options: {
  onNodesAdded?: (addedList: NodeList) => void;
  onNodesRemoved?: (removedList: NodeList) => void;
}) {
  const mutateObsCont = useRef<T>(null);

  useEffect(() => {
    if (mutateObsCont.current) {
      const mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          options.onNodesAdded?.(record.addedNodes);
          options.onNodesRemoved?.(record.removedNodes);
        }
      });

      mutationObserver.observe(mutateObsCont.current, { childList: true });

      return () => mutationObserver.disconnect();
    }
  }, []);

  return { observedAreaRef: mutateObsCont };
}
