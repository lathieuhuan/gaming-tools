import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { clsx, ItemCase, useIntersectionObserver, type EntitySelectRenderArgs } from "rond";

import { filterSortOptions } from "./_utils";
import { AppEntityOption, AppEntityOptionModel } from "./AppEntityOption";

/** false if this pick is invalid */
type Return = boolean | void;

export type OptionValidity = Return | Promise<Return>;

export type AfterSelectAppEntity = (itemCode: number, quantity?: number) => void;

export type AppEntityOptionsProps<T> = {
  className?: string;
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
    body: HTMLDivElement | null
  ) => ReactNode;
  onChange?: (entity: T | undefined, isConfigStep: boolean) => OptionValidity;
  onClose: () => void;
};

export function AppEntityOptions<T extends AppEntityOptionModel = AppEntityOptionModel>({
  className = "",
  data,
  shouldHideSelected,
  emptyText = "No data",
  hasConfigStep,
  initialActiveCode = -1,
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
  const [empty, setEmpty] = useState(false);
  const [overflow, setOverflow] = useState(true);

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver();

  useLayoutEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        inputRef?.current &&
        document.activeElement === inputRef.current &&
        inputRef.current.value.length
      ) {
        for (const item of itemUtils.queryAll()) {
          if (item.isVisible()) {
            const code = item.getId();
            const foundItem = code ? data.find((entity) => entity.code === +code) : undefined;

            if (foundItem) void selectOption(foundItem);
            return;
          }
        }
      }
    };

    document.addEventListener("keydown", handleEnter);

    if (initialActiveCode) {
      itemUtils.queryById(initialActiveCode)?.element.scrollIntoView();
    }

    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  }, []);

  useLayoutEffect(() => {
    // check if no item visible
    const visibleItems = itemUtils.queryAll().filter((item) => item.isVisible());

    setEmpty(!visibleItems.length);

    if (!visibleItems.length && hasConfigStep) {
      void onChange?.(undefined, true);
      setActiveCode(0);
    }

    // check if container overflow to add padding right
    const itemContainer = bodyRef.current?.querySelector(".item-container");
    const { parentElement } = itemContainer || {};
    const newOverflow = Boolean(
      itemContainer?.clientHeight &&
        parentElement?.clientHeight &&
        itemContainer.clientHeight > parentElement.clientHeight
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
    <div ref={bodyRef} className={"h-full flex custom-scrollbar gap-4 scroll-smooth " + className}>
      <div
        ref={observedAreaRef}
        className={clsx(
          "h-full w-full shrink-0 md:w-auto md:shrink md:min-w-100 xm:min-w-0 grow custom-scrollbar",
          overflow && "xm:pr-2",
          searchOn && "pt-8"
        )}
      >
        <div className="item-container flex flex-wrap">
          {options.map((option) => {
            return (
              <div
                key={option.key}
                {...itemUtils.getProps(option.key, [
                  "grow-0 p-2 relative",
                  itemWidthCls,
                  option.hidden && "hidden",
                ])}
              >
                <ItemCase
                  selected={option.key === activeCode}
                  onClick={() => void selectOption(option.data)}
                  // onDoubleClick={() => onDoubleClickPickerItem(item)}
                >
                  {(className, imgCls) => (
                    <AppEntityOption
                      className={className}
                      imgCls={imgCls}
                      visible={visibleMap[option.key]}
                      item={option.data}
                      selectedAmount={itemCounts[option.key] || 0}
                    />
                  )}
                </ItemCase>
              </div>
            );
          })}
        </div>

        {empty && <p className="py-4 text-light-hint text-lg text-center">{emptyText}</p>}
      </div>

      {hasConfigStep && (
        <div className="overflow-auto shrink-0">
          {renderOptionConfig?.(afterSelect, bodyRef.current)}
        </div>
      )}
    </div>
  );
}
