import { useEffect, useRef, useState } from "react";
import { FaCaretRight, FaMinus } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { ItemCase, clsx, useIntersectionObserver } from "rond";

import type { AppArtifact, AppWeapon, IDbArtifact, IDbWeapon } from "@/types";

import { $AppArtifact, $AppWeapon } from "@/services";

// Component
import { ItemThumbnail, type ItemThumbProps } from "../ItemThumbnail";

export function isWeapon(item: IDbWeapon | IDbArtifact): item is IDbWeapon {
  return "refi" in item;
}

export type ItemOption<
  T extends IDbWeapon | IDbArtifact,
  U = T extends IDbWeapon ? AppWeapon : AppArtifact
> = ItemThumbProps["item"] & {
  userData: T;
  data: U;
};

export type InventoryRackProps<
  T extends IDbWeapon | IDbArtifact,
  U = T extends IDbWeapon ? AppWeapon : AppArtifact
> = {
  itemCls?: string;
  emptyText?: string;
  chosenID?: number;
  selectedIds?: Set<PropertyKey>;
  /** Default 60 */
  pageSize?: number;
  data: T[];
  onUnselectItem?: (item: ItemOption<T, U>) => void;
  onChangeItem?: (item: ItemOption<T, U>) => void;
};

export function InventoryRack<
  T extends IDbWeapon | IDbArtifact,
  U = T extends IDbWeapon ? AppWeapon : AppArtifact
>({
  data,
  itemCls,
  emptyText = "No data",
  chosenID,
  selectedIds,
  pageSize = 60,
  onUnselectItem,
  onChangeItem,
}: InventoryRackProps<T, U>): JSX.Element {
  const pioneerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  // const dataByCode = useRef<Record<number, T extends IDbWeapon ? AppWeapon : AppArtifact>>({});

  const [ready, setReady] = useState(false);
  const [pageNo, setPageNo] = useState(0);

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver({
    ready,
    dependencies: [ready, data, pageNo, pageSize],
  });

  useEffect(() => {
    if (pioneerRef.current) {
      heightRef.current = pioneerRef.current.clientHeight;
      setReady(true);
    }
  }, []);

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

  const deadEnd = Math.ceil(data.length / pageSize) - 1;
  const firstIndex = pageSize * pageNo;
  const nextFirstIndex = firstIndex + pageSize;

  const resetScroll = () => {
    if (observedAreaRef.current) {
      observedAreaRef.current.scrollTop = 0;
    }
  };

  const goBack = () => {
    setPageNo((prev) => prev - 1);
    resetScroll();
  };

  const goNext = () => {
    setPageNo((prev) => prev + 1);
    resetScroll();
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
              const isOnPage = index >= firstIndex && index < nextFirstIndex;
              const rendered = isOnPage && visible;
              const option = rendered ? toItemOption(item) : undefined;

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
                  {option && (
                    <>
                      {selectedIds?.has(item.ID) && (
                        <button
                          className="absolute z-10 top-1 left-1 w-8 h-8 flex-center bg-danger-1 rounded-md"
                          onClick={() => onUnselectItem?.(option)}
                        >
                          <FaMinus />
                        </button>
                      )}
                      <ItemCase
                        chosen={item.ID === chosenID}
                        onClick={() => onChangeItem?.(option)}
                      >
                        {(className, imgCls) => (
                          <ItemThumbnail className={className} imgCls={imgCls} item={option} />
                        )}
                      </ItemCase>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {ready && !data.length ? (
          <p className="py-4 text-light-hint text-lg text-center">{emptyText}</p>
        ) : null}
      </div>

      {data.length !== 0 && (
        <div className="mt-2 h-7 shrink-0 relative">
          {deadEnd !== 0 && (
            <div className="flex-center space-x-2">
              <button
                className="w-7 h-7 flex-center glow-on-hover disabled:opacity-50"
                disabled={pageNo <= 0}
                onClick={goBack}
              >
                {pageNo > 0 ? (
                  <FaCaretRight className="rotate-180 text-2xl" />
                ) : (
                  <TbRectangleVerticalFilled className="text-lg" />
                )}
              </button>

              <p className="font-semibold">
                <span className="text-heading">{pageNo + 1}</span> / {deadEnd + 1}
              </p>

              <button
                className="w-7 h-7 flex-center glow-on-hover disabled:opacity-50"
                disabled={pageNo >= deadEnd}
                onClick={goNext}
              >
                {pageNo < deadEnd ? (
                  <FaCaretRight className="text-2xl" />
                ) : (
                  <TbRectangleVerticalFilled className="text-lg" />
                )}
              </button>
            </div>
          )}

          <div className="absolute bottom-1 right-4 mr-2 text-sm leading-none text-light-hint">
            {data.length} items
          </div>
        </div>
      )}
    </div>
  );
}
