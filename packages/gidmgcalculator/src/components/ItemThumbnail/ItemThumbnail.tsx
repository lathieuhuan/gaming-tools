import { clsx } from "rond";
import type { Level } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { GenshinImage } from "../GenshinImage";

interface ItemThumbProps {
  className?: string;
  imgCls?: string;
  item: {
    beta?: boolean;
    icon: string;
    rarity: number;
    level: Level | number;
    refi?: number;
    owner?: string | null;
    setupIDs?: number[];
  };
}
export const ItemThumbnail = ({ className, imgCls, item }: ItemThumbProps) => {
  //
  const renderSideIcon = (owner: string) => {
    const { icon = "", sideIcon } = $AppCharacter.get(owner) || {};
    return (
      <div
        className={clsx(
          "absolute -top-1 -right-1 z-10 w-7 h-7 bg-black/60 border-2 border-light-400 rounded-circle",
          !sideIcon && "overflow-hidden"
        )}
      >
        <GenshinImage
          imgCls={clsx("max-w-none w-10 h-10 -translate-x-2 -translate-y-4", !sideIcon && "-translate-y-2")}
          src={sideIcon || icon}
          defaultFallback={{ className: "p-1" }}
        />
      </div>
    );
  };

  return (
    <div className={clsx("bg-light-400 rounded flex flex-col cursor-pointer relative", className)}>
      {item.owner && renderSideIcon(item.owner)}

      {item.refi !== undefined ? (
        <p
          className={
            "absolute top-1 left-1 rounded px-1 text-sm font-bold " +
            (item.refi === 5 ? "bg-black text-orange-500" : "bg-black/60 text-light-400")
          }
        >
          {item.refi}
        </p>
      ) : null}

      <div className={`aspect-square bg-gradient-${item.rarity || 5} ` + "rounded rounded-br-2xl overflow-hidden"}>
        <GenshinImage
          className={imgCls}
          src={item.icon}
          defaultFallback={{ wrapperCls: "p-3" }}
          imgType={item.refi ? "weapon" : "artifact"}
        />
      </div>

      <div className="flex-center bg-light-400 rounded-b">
        <p className="font-bold text-black">
          Lv. {typeof item.level === "string" ? item.level.split("/")[0] : item.level}
        </p>
      </div>
    </div>
  );
};
