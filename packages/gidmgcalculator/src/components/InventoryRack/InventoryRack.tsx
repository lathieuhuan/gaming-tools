import { useEffect, useRef, useState } from "react";
import { FaMinus } from "react-icons/fa";
import { ItemCase, clsx, useIntersectionObserver } from "rond";

import type { AppArtifact, AppWeapon, RawItem, RawWeapon } from "@/types";

import { isWeapon } from "@/logic/entity.logic";
import { $AppArtifact, $AppWeapon } from "@/services";

// Component
import { ItemThumbnail, type ItemThumbProps } from "../ItemThumbnail";
import { Pagination } from "./Pagination";

export type ItemOption<
  T extends RawItem,
  U = T extends RawWeapon ? AppWeapon : AppArtifact
> = ItemThumbProps["item"] & {
  userData: T;
  data: U;
};

export type InventoryRackProps<
  T extends RawItem,
  U = T extends RawWeapon ? AppWeapon : AppArtifact
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
  U = T extends RawWeapon ? AppWeapon : AppArtifact
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
  const pioneerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver({
    ready,
    dependencies: [ready, data, pageIndex, pageSize],
  });

  useEffect(() => {
    if (pioneerRef.current) {
      heightRef.current = pioneerRef.current.clientHeight;
      setReady(true);
    }
  }, []);

  const firstItemIndex = pageSize * pageIndex;
  const nextFirstItemIndex = firstItemIndex + pageSize;

  const resetScroll = () => {
    if (observedAreaRef.current) {
      observedAreaRef.current.scrollTop = 0;
    }
  };

  const handlePageIndexChange = (pageIndex: number) => {
    setPageIndex(pageIndex);
    resetScroll();
  };

  const toItemOption = (item: T): ItemOption<T, U> => {
    if (isWeapon(item)) {
      const data = $AppWeapon.get(item.code)!;

      return {
        icon: data.icon,
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
      icon: data[item.type].icon,
      rarity: item.rarity,
      level: item.level,
      owner: item.owner,
      userData: item,
      data: data as U,
    };
  };

  const renderItem = (item: T) => {
    const option = toItemOption(item);

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
    <div className="w-full flex flex-col overflow-hidden" style={{ minWidth: "21rem" }}>
      <div
        ref={observedAreaRef}
        className="grow custom-scrollbar xm:pr-2"
        style={{ overflowX: "hidden" }}
      >
        {!ready && (
          <div ref={pioneerRef} className={clsx("opacity-0", itemCls)}>
            <ItemThumbnail item={{ icon: "", level: "1/20", rarity: 5 }} />
          </div>
        )}

        {ready && data.length !== 0 && (
          <div className="flex flex-wrap">
            {data.map((item, index) => {
              const visible = visibleMap[item.code];
              const isOnPage = index >= firstItemIndex && index < nextFirstItemIndex;
              const rendered = isOnPage && visible;

              return (
                <div
                  key={item.ID}
                  {...itemUtils.getProps(item.code, [
                    "p-2 transition-opacity duration-400 relative",
                    rendered ? "opacity-100" : "opacity-0 !p-0",
                    itemCls,
                  ])}
                  style={{
                    height: isOnPage ? (visible ? "auto" : heightRef.current) : 0,
                  }}
                >
                  {rendered && renderItem(item)}
                </div>
              );
            })}
          </div>
        )}

        {ready && !data.length && (
          <p className="py-4 text-light-hint text-lg text-center">{emptyText}</p>
        )}
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
