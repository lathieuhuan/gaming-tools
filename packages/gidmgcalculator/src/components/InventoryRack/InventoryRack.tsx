import { useState } from "react";
import { FaMinus } from "react-icons/fa";
import { cn, ItemCase, useIntersectionObserver } from "rond";

import type { AppArtifact, AppWeapon, RawItem, RawWeapon } from "@/types";

import { isWeapon } from "@/logic/entity.logic";
import { $AppArtifact, $AppWeapon } from "@/services";

// Component
import { ItemThumbnail, type ItemThumbProps } from "../ItemThumbnail";
import { Pagination } from "./Pagination";

export type ItemOption<
  T extends RawItem,
  U = T extends RawWeapon ? AppWeapon : AppArtifact,
> = ItemThumbProps["item"] & {
  userData: T;
  data: U;
};

export type InventoryRackProps<
  T extends RawItem,
  U = T extends RawWeapon ? AppWeapon : AppArtifact,
> = {
  itemCls?: string;
  emptyText?: string;
  activeId?: number;
  selectedIds?: Set<PropertyKey>;
  /** Default 60 */
  pageSize?: number;
  data: T[];
  onUnselectItem?: (item: ItemOption<NoInfer<T>, U>) => void;
  onChangeItem?: (item: ItemOption<NoInfer<T>, U>) => void;
};

export function InventoryRack<
  T extends RawItem,
  U = T extends RawWeapon ? AppWeapon : AppArtifact,
>({
  data,
  itemCls,
  emptyText = "No data",
  activeId,
  selectedIds,
  pageSize = 60,
  onUnselectItem,
  onChangeItem,
}: InventoryRackProps<T, U>): JSX.Element {
  const [pageIndex, setPageIndex] = useState(0);

  const { container } = useIntersectionObserver({
    deps: [data, pageIndex, pageSize],
  });

  const firstItemIndex = pageSize * pageIndex;
  const nextFirstItemIndex = firstItemIndex + pageSize;

  const resetScroll = () => {
    if (container.ref.current) {
      container.ref.current.scrollTop = 0;
    }
  };

  const handlePageIndexChange = (pageIndex: number) => {
    setPageIndex(pageIndex);
    resetScroll();
  };

  const toItemOption = (item: T, viewed: boolean): ItemOption<T, U> => {
    if (isWeapon(item)) {
      const data = $AppWeapon.get(item.code)!;

      return {
        icon: viewed ? data.icon : undefined,
        rarity: data.rarity,
        level: item.level,
        refi: item.refi,
        owner: item.owner,
        userData: item,
        data: data as U,
      };
    }

    const data = $AppArtifact.getSet(item.code)!;

    return {
      icon: viewed ? data[item.type].icon : undefined,
      rarity: item.rarity,
      level: item.level,
      owner: item.owner,
      userData: item,
      data: data as U,
    };
  };

  const renderItem = (item: T, viewed: boolean) => {
    const option = toItemOption(item, viewed);

    return (
      <>
        {selectedIds?.has(item.ID) && (
          <button
            className="absolute z-10 top-1 left-1 w-8 h-8 flex-center bg-danger-1 rounded-md"
            onClick={() => onUnselectItem?.(option)}
          >
            <FaMinus />
          </button>
        )}
        <ItemCase selected={item.ID === activeId} onClick={() => onChangeItem?.(option)}>
          {(className, imgCls) => (
            <ItemThumbnail className={className} imgCls={imgCls} item={option} />
          )}
        </ItemCase>
      </>
    );
  };

  return (
    <div className="w-full min-w-84 flex flex-col overflow-hidden">
      <div ref={container.ref} className="grow custom-scrollbar overflow-x-hidden xm:pr-2">
        <div className="flex flex-wrap peer">
          {data.map((dataItem, index) => {
            const viewed = container.isItemViewed(dataItem.code);
            const isOnPage = index >= firstItemIndex && index < nextFirstItemIndex;

            return (
              <div
                key={dataItem.ID}
                className={cn(
                  "p-2 transition-opacity duration-400 relative",
                  isOnPage && viewed ? "opacity-100" : "opacity-0",
                  itemCls,
                )}
                hidden={!isOnPage}
                data-index={index}
                {...container.itemAttributes(dataItem.code)}
              >
                {isOnPage && renderItem(dataItem, viewed)}
              </div>
            );
          })}
        </div>

        <p className="py-4 text-light-hint text-lg text-center peer-has-[>:not([hidden])]:hidden">
          {emptyText}
        </p>
      </div>

      {data.length !== 0 && (
        <Pagination
          className="mt-3 pl-2 pr-4"
          total={data.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onChange={handlePageIndexChange}
        />
      )}
    </div>
  );
}
