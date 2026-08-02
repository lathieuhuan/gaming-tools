import { DependencyList, useEffect, useRef, useState } from "react";
import { Container, ObservedItem, ViewMap } from "./Container";

export type UseIntersectionObserverOptions = {
  deps?: DependencyList;
  ready?: boolean;
  resetOnDepsChange?: boolean;
};

export function useIntersectionObserver<
  ObservedArea extends HTMLElement = HTMLDivElement,
  ObservedElement extends HTMLElement = HTMLDivElement,
>(options: UseIntersectionObserverOptions = {}) {
  const { deps = [], ready = true, resetOnDepsChange = false } = options;

  const observerRef = useRef<IntersectionObserver>();
  const [container, setContainer] = useState(() => new Container<ObservedArea, ObservedElement>());

  const observe = (element: Element) => {
    observerRef.current?.observe(element);
  };

  const unobserve = (element: Element) => {
    observerRef.current?.unobserve(element);
  };

  useEffect(() => {
    if (!ready) {
      return;
    }

    let viewedMapRef: ViewMap;

    if (resetOnDepsChange) {
      viewedMapRef = new Map();

      if (container.viewedMap.size > 0) {
        setContainer(new Container(new Map()));
      }
    } else {
      // Create a clone here because viewedMap is stale
      viewedMapRef = new Map(container.viewedMap);
    }

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      let changed = false;
      const newViewedMap = new Map(viewedMapRef);

      for (const entry of entries) {
        const itemId = ObservedItem.fromEl(entry.target)?.id;

        if (entry.isIntersecting && itemId && !newViewedMap.get(itemId)) {
          newViewedMap.set(itemId, true);
          changed = true;
        }
      }

      if (changed) {
        setContainer(new Container(newViewedMap));
        viewedMapRef = newViewedMap;
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: container.ref.current,
    });

    container.getAllItems().forEach((item) => observe(item.element));

    return () => {
      observerRef.current?.disconnect();
    };
  }, deps);

  return {
    container,
    observe,
    unobserve,
  };
}
