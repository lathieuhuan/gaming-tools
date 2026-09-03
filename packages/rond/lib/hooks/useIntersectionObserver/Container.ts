import { createRef } from "react";

type ObservedItemId = string | number;

export type ViewMap = Map<string, boolean>;

export type ItemAttributes = {
  "data-id": string;
  "data-name": string;
  "data-viewed": boolean;
};

function itemSelector(attributes: Partial<ItemAttributes>): string {
  const selector = Object.entries(attributes).reduce((acc, [key, value]) => {
    return value !== undefined ? `${acc}[${key}="${value}"]` : acc;
  }, "");

  return selector.length > 0 ? selector : "invalid";
}

export class Container<
  ObservedArea extends HTMLElement = HTMLDivElement,
  ObservedElement extends HTMLElement = HTMLDivElement,
> {
  constructor(
    public viewedMap: ViewMap = new Map(),
    public ref = createRef<ObservedArea>(),
  ) {}

  getItemById = (id: ObservedItemId): ObservedItem<ObservedElement> | null => {
    const element = this.ref.current?.querySelector(
      itemSelector({
        "data-name": ObservedItem.NAME,
        "data-id": `${id}`,
      }),
    );

    return element ? new ObservedItem(element as ObservedElement) : null;
  };

  getAllItems = (): ObservedItem<ObservedElement>[] => {
    const items = this.ref.current?.querySelectorAll(
      itemSelector({
        "data-name": ObservedItem.NAME,
      }),
    );

    return items
      ? Array.from(items, (element) => new ObservedItem(element as ObservedElement))
      : [];
  };

  isItemViewed = (id: ObservedItemId) => {
    return this.viewedMap.get(`${id}`) === true;
  };

  itemAttributes = (id: string | number): ItemAttributes => {
    return {
      "data-id": `${id}`,
      "data-name": ObservedItem.NAME,
      "data-viewed": this.isItemViewed(id),
    };
  };

  /** Create new instance, no mutation */
  update = (viewedMap: ViewMap) => {
    return new Container<ObservedArea, ObservedElement>(viewedMap, this.ref);
  };
}

export class ObservedItem<ObservedElement extends HTMLElement = HTMLDivElement> {
  //
  static readonly NAME = "observed-item";

  static fromEl(element: Element) {
    return element instanceof HTMLElement ? new ObservedItem(element) : null;
  }

  constructor(public element: ObservedElement) {}

  private attribute(key: keyof ItemAttributes) {
    return this.element.getAttribute(key);
  }

  get id() {
    return this.attribute("data-id") || "";
  }

  get viewed(): boolean {
    return this.attribute("data-viewed") === "true";
  }

  is(id: ObservedItemId) {
    return this.id === `${id}`;
  }
}
