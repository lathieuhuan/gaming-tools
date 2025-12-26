import clsx, { type ClassValue } from "clsx";
import { useState, useEffect, useRef } from "react";

const observedItemCls = "observed-item";
const observedIdKey = "data-id";

type ObservedItemId = string | number;

export class ObservedItem<ObservedElement extends HTMLElement = HTMLDivElement> {
  element: ObservedElement;

  constructor(element: ObservedElement) {
    this.element = element;
  }

  getId = () => this.element.getAttribute(observedIdKey);

  isVisible = () => window.getComputedStyle(this.element).display !== "none";
}

type UseIntersectionObserverOptions = {
  dependencies?: React.DependencyList;
  ready?: boolean;
};
export function useIntersectionObserver<
  ObservedArea extends HTMLElement = HTMLDivElement,
  ObservedElement extends HTMLElement = HTMLDivElement
>(options?: UseIntersectionObserverOptions) {
  const observedAreaRef = useRef<ObservedArea>(null);
  const observerRef = useRef<IntersectionObserver>();
  const [visibleMap, setVisibleItems] = useState<Record<string, boolean>>({});

  const { dependencies = [], ready = true } = options || {};

  const queryObservedItem = (id: ObservedItemId): ObservedItem<ObservedElement> | null => {
    const element = observedAreaRef.current?.querySelector(`.${observedItemCls}[${observedIdKey}="${id}"]`);
    return element ? new ObservedItem(element as ObservedElement) : null;
  };

  const queryAllObservedItems = (): Array<ObservedItem<ObservedElement>> => {
    const items = observedAreaRef.current?.querySelectorAll(`.${observedItemCls}`);
    return items ? Array.from(items, (element) => new ObservedItem(element as ObservedElement)) : [];
  };

  const observe = (element: Element) => {
    observerRef.current?.observe(element);
  };

  const unobserve = (element: Element) => {
    observerRef.current?.unobserve(element);
  };

  useEffect(() => {
    if (ready) {
      let visibleMapRef = { ...visibleMap };

      const handleIntersection: IntersectionObserverCallback = (entries) => {
        let hasChanged = false;
        const newVisibleMap = { ...visibleMapRef };

        entries.forEach((entry) => {
          const itemId = entry.target.getAttribute(observedIdKey);

          if (entry.isIntersecting && itemId && !newVisibleMap[itemId]) {
            newVisibleMap[itemId] = true;
            hasChanged = true;
          }
        });

        if (hasChanged) {
          setVisibleItems(newVisibleMap);
          visibleMapRef = newVisibleMap;
        }
      };

      observerRef.current = new IntersectionObserver(handleIntersection, {
        root: observedAreaRef.current,
      });

      queryAllObservedItems().forEach((item) => observe(item.element));

      return () => observerRef.current?.disconnect();
    }
    return;
  }, dependencies);

  const getObservedItemProps = (id: string | number, className?: ClassValue) => {
    return {
      className: clsx(observedItemCls, className),
      [observedIdKey]: id,
    };
  };

  return {
    observedAreaRef,
    visibleMap,
    itemUtils: {
      observe,
      unobserve,
      getProps: getObservedItemProps,
      queryAll: queryAllObservedItems,
      queryById: queryObservedItem,
    },
  };
}
