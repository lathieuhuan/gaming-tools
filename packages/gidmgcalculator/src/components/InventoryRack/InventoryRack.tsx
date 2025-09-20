import { useRef, useState, useEffect } from "react";
import { FaCaretRight, FaMinus } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { ItemCase, clsx, useIntersectionObserver } from "rond";

import type { Artifact, Weapon } from "@/types";
import { $AppArtifact, $AppWeapon } from "@/services";
import Entity_ from "@/utils/Entity";

// Component
import { ItemThumbnail, type ItemThumbProps } from "../ItemThumbnail";

type ItemModel = ItemThumbProps["item"];

type OptionalOwned<T> = T & {
  owner?: ItemModel["owner"];
};

function getWeaponInfo({ code, refi, level, owner }: OptionalOwned<Weapon>): ItemModel {
  const { icon = "", rarity = 5 } = $AppWeapon.get(code) || {};
  return { icon, rarity, level, refi, owner };
}

function getArtifactInfo({ code, type, rarity, level, owner }: OptionalOwned<Artifact>): ItemModel {
  const { icon = "" } = $AppArtifact.get({ code, type }) || {};
  return { icon, rarity, level, owner };
}

type InventoryRackProps<T> = {
  itemCls?: string;
  emptyText?: string;
  chosenID?: number;
  selectedIds?: Set<PropertyKey>;
  /** Default to 60 */
  pageSize?: number;
  data: T[];
  onUnselectItem?: (item: T) => void;
  onChangeItem?: (item: T) => void;
};

export function InventoryRack<T extends Weapon | Artifact>({
  data,
  itemCls,
  emptyText = "No data",
  chosenID,
  selectedIds,
  pageSize = 60,
  onUnselectItem,
  onChangeItem,
}: InventoryRackProps<T>): JSX.Element {
  const pioneerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [pageNo, setPageNo] = useState(0);

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver({
    ready,
    dependecies: [ready, data, pageNo, pageSize],
  });

  useEffect(() => {
    if (pioneerRef.current) {
      heightRef.current = pioneerRef.current.clientHeight;
      setReady(true);
    }
  }, []);

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

        {ready && data.length ? (
          <div className="flex flex-wrap">
            {data.map((item, index) => {
              const isOnPage = index >= firstIndex && index < nextFirstIndex;
              const visible = visibleMap[item.code];

              return (
                <div
                  key={item.ID}
                  {...itemUtils.getProps(item.code, [
                    "p-2 transition-opacity duration-400 relative",
                    isOnPage && visible ? "opacity-100" : "opacity-0 !p-0",
                    itemCls,
                  ])}
                  style={{
                    height: isOnPage ? (visible ? "auto" : heightRef.current) : 0,
                  }}
                >
                  {isOnPage && visible ? (
                    <>
                      {selectedIds?.has(item.ID) && (
                        <button
                          className="absolute z-10 top-1 left-1 w-8 h-8 flex-center bg-danger-1 rounded-md"
                          onClick={() => onUnselectItem?.(item)}
                        >
                          <FaMinus />
                        </button>
                      )}
                      <ItemCase chosen={item.ID === chosenID} onClick={() => onChangeItem?.(item)}>
                        {(className, imgCls) => (
                          <ItemThumbnail
                            className={className}
                            imgCls={imgCls}
                            item={
                              Entity_.isWeapon(item) ? getWeaponInfo(item) : getArtifactInfo(item)
                            }
                          />
                        )}
                      </ItemCase>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {ready && !data.length ? (
          <p className="py-4 text-hint-color text-lg text-center">{emptyText}</p>
        ) : null}
      </div>

      {data.length ? (
        <div className="mt-2 h-7 shrink-0 relative">
          {deadEnd ? (
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
                <span className="text-heading-color">{pageNo + 1}</span> / {deadEnd + 1}
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
          ) : null}

          <div className="absolute bottom-1 right-4 mr-2 text-sm leading-none text-hint-color">
            {data.length} items
          </div>
        </div>
      ) : null}
    </div>
  );
}
