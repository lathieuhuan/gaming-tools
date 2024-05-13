import { useRef, useState, useEffect } from "react";
import { FaCaretRight, FaMinus, FaSquare } from "react-icons/fa";
import { ItemCase, clsx, useIntersectionObserver } from "rond";

import type { UserArtifact, UserItem, UserWeapon } from "@Src/types";
import type { ArtifactRackProps, InventoryRackProps, MixedRackProps, WeaponRackProps } from "./inventory.types";
import { $AppArtifact, $AppWeapon } from "@Src/services";
import { Utils_ } from "@Src/utils";

// Component
import { ItemThumbnail } from "../ItemThumbnail";

const getWeaponInfo = ({ code, owner, refi, level, setupIDs }: UserWeapon) => {
  const { beta, name, icon = "", rarity = 5 } = $AppWeapon.get(code) || {};
  return { beta, name, icon, rarity, level, refi, owner, setupIDs };
};

const getArtifactInfo = ({ code, type, owner, rarity, level, setupIDs }: UserArtifact) => {
  const { beta, name, icon = "" } = $AppArtifact.get({ code, type }) || {};
  return { beta, name, icon, rarity, level, owner, setupIDs };
};

export function InventoryRack(props: WeaponRackProps): JSX.Element;
export function InventoryRack(props: ArtifactRackProps): JSX.Element;
export function InventoryRack(props: MixedRackProps): JSX.Element;
export function InventoryRack<T extends UserItem>({
  data,
  itemCls,
  emptyText = "No data",
  chosenID,
  chosenIDs,
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
    <div className="w-full flex flex-col" style={{ minWidth: "21rem" }}>
      <div ref={observedAreaRef} className="grow custom-scrollbar xm:pr-2" style={{ overflowX: "hidden" }}>
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
                      {chosenIDs?.[item.ID] && (
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
                            item={Utils_.isUserWeapon(item) ? getWeaponInfo(item) : getArtifactInfo(item)}
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

        {ready && !data.length ? <p className="py-4 text-hint-color text-lg text-center">{emptyText}</p> : null}
      </div>

      {data.length && deadEnd ? (
        <div className="pt-2 flex-center space-x-2">
          <button
            className="w-7 h-7 flex-center glow-on-hover disabled:opacity-50"
            disabled={pageNo <= 0}
            onClick={goBack}
          >
            {pageNo > 0 ? <FaCaretRight className="rotate-180 text-2xl" /> : <FaSquare className="text-lg" />}
          </button>

          <p className="font-semibold">
            <span className="text-heading-color">{pageNo + 1}</span> / {deadEnd + 1}
          </p>

          <button
            className="w-7 h-7 flex-center glow-on-hover disabled:opacity-50"
            disabled={pageNo >= deadEnd}
            onClick={goNext}
          >
            {pageNo < deadEnd ? <FaCaretRight className="text-2xl" /> : <FaSquare className="text-lg" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
