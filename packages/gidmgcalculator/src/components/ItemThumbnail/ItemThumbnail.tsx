import { clsx } from "rond";
import { Level } from "@Calculation";

import { $AppCharacter } from "@/services";
import { GenshinImage } from "../GenshinImage";

export interface ItemThumbProps {
  className?: string;
  imgCls?: string;
  title?: string;
  /** No cursor-pointer */
  muted?: boolean;
  /** Smaller layout by placing level at absolute bottom */
  compact?: boolean;
  /** Default to true */
  showOwner?: boolean;
  item: {
    icon: string;
    rarity?: number;
    level?: Level | number;
    refi?: number;
    owner?: string | null;
  };
}
export function ItemThumbnail(props: ItemThumbProps) {
  const { showOwner = true, compact, item } = props;
  const lvText =
    item.level === undefined ? null : `Lv. ${typeof item.level === "string" ? item.level.split("/")[0] : item.level}`;

  const renderSideIcon = (owner: string) => {
    const { icon = "", sideIcon } = $AppCharacter.get(owner) || {};
    return (
      <div
        className={clsx(
          "absolute -top-1 -right-1 z-10 w-7 h-7 bg-black/60 border-2 border-light-default rounded-circle",
          !sideIcon && "overflow-hidden"
        )}
      >
        <GenshinImage
          className={clsx("max-w-none w-10 h-10 -translate-x-2 -translate-y-4", !sideIcon && "-translate-y-2")}
          src={sideIcon || icon}
          fallbackCls="mt-4 p-1 h-6"
        />
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "bg-light-default rounded flex flex-col relative",
        compact && "overflow-hidden",
        !props.muted && "cursor-pointer",
        props.className
      )}
      title={props.title}
    >
      {showOwner && item.owner && !compact ? renderSideIcon(item.owner) : null}

      {item.refi !== undefined ? (
        <p
          className={
            "absolute top-1 left-1 rounded px-1 text-sm font-bold " +
            (item.refi === 5 ? "bg-black text-heading-color" : "bg-black/60 text-light-default")
          }
        >
          {item.refi}
        </p>
      ) : null}

      <div
        className={clsx(
          "aspect-square overflow-hidden",
          item.rarity && `bg-gradient-${item.rarity}`,
          !compact && "rounded rounded-br-2xl "
        )}
      >
        <GenshinImage
          className={props.imgCls}
          src={item.icon}
          fallbackCls={compact ? "p-2" : "p-3"}
          imgType={item.refi ? "weapon" : "artifact"}
        />
      </div>

      {lvText ? (
        compact ? (
          <div className="flex-center bg-black/60 w-full absolute bottom-0">
            <p className="font-bold text-light-default text-sm">{lvText}</p>
          </div>
        ) : (
          <div className="flex-center bg-light-default">
            <p className="font-bold text-black">{lvText}</p>
          </div>
        )
      ) : null}
    </div>
  );
}
