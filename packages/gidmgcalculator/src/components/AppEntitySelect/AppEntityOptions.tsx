import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  clsx,
  ItemCase,
  ObservedItem,
  useIntersectionObserver,
  type EntitySelectRenderArgs,
} from "rond";

import { AppEntityOption } from "./AppEntityOption";
import { filterSortOptions } from "./filterSortOptions";
import type { AppEntityOptionModel } from "./types";

/** false if this pick is invalid */
type Return = boolean | void;

export type OptionValidity = Return | Promise<Return>;

export type AfterSelectAppEntity = (itemCode: number, quantity?: number) => void;

export type AppEntityOptionsProps<T> = {
  data: T[];
  initialActiveCode?: number;
  hiddenCodes?: Set<number>;
  /** Default 'No data' */
  emptyText?: string;
  hasConfigStep?: boolean;
  /** Only in multiple mode, implemented in afterSelect */
  shouldHideSelected?: boolean;
  /** Remember to handle case shouldHideSelected */
  renderOptionConfig?: (
    afterSelect: AfterSelectAppEntity,
    body: HTMLDivElement | null,
  ) => ReactNode;
  onChange?: (entity: T | undefined, isConfigStep: boolean) => OptionValidity;
  onClose: () => void;
};

export function AppEntityOptions<T extends AppEntityOptionModel = AppEntityOptionModel>({
  data,
  shouldHideSelected,
  emptyText = "No data",
  hasConfigStep,
  initialActiveCode,
  hiddenCodes,
  renderOptionConfig,
  onChange,
  onClose,
  isMultiSelect,
  keyword,
  searchOn,
  inputRef,
}: AppEntityOptionsProps<T> & Partial<EntitySelectRenderArgs>) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});
  // for hidden
  const [pickedCodes, setPickedCodes] = useState(new Set<number>());
  // for highlight
  const [activeCode, setActiveCode] = useState(initialActiveCode);
  const [overflow, setOverflow] = useState(true);

  const { container } = useIntersectionObserver();

  const isItemVisible = (item: ObservedItem<HTMLDivElement>) => {
    return item.viewed && !item.element.hidden;
  };

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      const inputEl = inputRef?.current;

      if (
        e.key === "Enter" &&
        inputEl &&
        inputEl === document.activeElement &&
        inputEl.value.length
      ) {
        const firstVisibleItem = container.getAllItems().find(isItemVisible);
        const dataItem =
          firstVisibleItem && data.find((entity) => firstVisibleItem.is(entity.code));

        if (dataItem) {
          void selectOption(dataItem);
        }
      }
    };

    document.addEventListener("keydown", handleEnter);

    if (initialActiveCode) {
      container.getItemById(initialActiveCode)?.element.scrollIntoView();
    }

    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  }, []);

  useLayoutEffect(() => {
    const noItemVisible = !container.getAllItems().some(isItemVisible);

    if (noItemVisible && hasConfigStep) {
      void onChange?.(undefined, true);
      setActiveCode(0);
    }

    // check if container overflow to add padding right
    const observerEl = container.ref.current;
    const observerHeight = observerEl?.clientHeight;
    const containerHeight = observerEl?.firstElementChild?.clientHeight;

    const newOverflow = Boolean(
      containerHeight && observerHeight && containerHeight > observerHeight,
    );

    if (newOverflow !== overflow) {
      setOverflow(newOverflow);
    }
  }, [hiddenCodes, pickedCodes, keyword]);

  const afterSelect: AfterSelectAppEntity = (itemCode, quantity = 1) => {
    if (isMultiSelect) {
      if (shouldHideSelected) {
        return setPickedCodes(new Set(pickedCodes).add(itemCode));
      }
      const newCounts = { ...itemCounts };
      newCounts[itemCode] = (newCounts[itemCode] || 0) + quantity;

      return setItemCounts(newCounts);
    }

    onClose();
  };

  const selectOption = async (item: T) => {
    if (!onChange) return;

    if (hasConfigStep) {
      if (item.code !== activeCode) {
        await onChange(item, true);
        setActiveCode(item.code);
      }
      if (bodyRef.current) {
        bodyRef.current.scrollLeft = 999;
      }

      return;
    }

    const valid = (await onChange(item, false)) ?? true;

    if (valid) {
      afterSelect(item.code);
    }
  };

  const options = filterSortOptions(data, [pickedCodes, hiddenCodes], keyword);

  const itemWidthCls = [
    "max-w-1/3 basis-1/3 sm:w-1/4 sm:basis-1/4",
    hasConfigStep
      ? "xm:max-w-1/3 xm:basis-1/3 lg:max-w-1/5 lg:basis-1/5"
      : "md:max-w-1/5 md:basis-1/5 xm:max-w-1/6 xm:basis-1/6 lg:max-w-1/8 lg:basis-1/8",
  ];

  return (
    <div ref={bodyRef} className="h-full flex custom-scrollbar gap-4 scroll-smooth">
      <div
        ref={container.ref}
        className={clsx(
          "h-full w-full shrink-0 md:w-auto md:shrink md:min-w-100 xm:min-w-0 grow custom-scrollbar",
          overflow && "xm:pr-2",
          searchOn && "pt-8",
        )}
      >
        <div className="flex flex-wrap peer">
          {options.map((option) => {
            return (
              <div
                key={option.key}
                className={clsx("grow-0 p-2 relative", itemWidthCls)}
                hidden={option.hidden}
                {...container.itemAttributes(option.key)}
              >
                <ItemCase
                  selected={option.key === activeCode}
                  onClick={() => void selectOption(option.data)}
                >
                  {(className, imgCls) => (
                    <AppEntityOption
                      className={className}
                      imgCls={imgCls}
                      item={option.data}
                      viewed={container.isItemViewed(option.key)}
                      selectedAmount={itemCounts[option.key] || 0}
                    />
                  )}
                </ItemCase>
              </div>
            );
          })}
        </div>

        <p className="py-4 text-light-hint text-lg text-center peer-has-[>:not([hidden])]:hidden">
          {emptyText}
        </p>
      </div>

      {hasConfigStep && (
        <div className="overflow-auto shrink-0">
          {renderOptionConfig?.(afterSelect, bodyRef.current)}
        </div>
      )}
    </div>
  );
}
