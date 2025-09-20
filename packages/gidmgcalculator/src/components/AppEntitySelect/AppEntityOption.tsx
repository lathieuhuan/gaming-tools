import { ElementType, WeaponType } from "@Calculation";
import { memo } from "react";
import { Badge, clsx } from "rond";

import { ElementIcon } from "@/components/ElementIcon";
import { GenshinImage } from "@/components/GenshinImage";

export type AppEntityOptionModel = {
  code: number;
  beta?: boolean;
  name: string;
  icon: string;
  rarity?: number;
  vision?: ElementType;
  /** Weapon type or Artifact type */
  type?: string;
  weaponType?: WeaponType;
  cons?: number;
  artifactIDs?: (number | null)[];
};

type AppEntityOptionProps = {
  className?: string;
  imgCls?: string;
  visible: boolean;
  item: AppEntityOptionModel;
  selectedAmount?: number;
};

const AppEntityOptionCore = ({
  className,
  imgCls,
  visible,
  item,
  selectedAmount,
}: AppEntityOptionProps) => {
  return (
    <div title={item.name} className={clsx("rounded-lg cursor-pointer relative", className)}>
      <Badge active={item.beta} className="absolute -top-1 -left-1 z-10">
        BETA
      </Badge>

      <div
        className={clsx(
          "overflow-hidden relative rounded-t-lg",
          item.rarity && `bg-gradient-${item.rarity}`,
          item.vision ? "pt-4" : "p-1"
        )}
      >
        <div
          className={`aspect-square transition-opacity duration-400 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {visible && (
            <GenshinImage className={imgCls} src={item.icon} imgType="unknown" fallbackCls="p-4" />
          )}
        </div>

        {selectedAmount ? (
          <p className="absolute bottom-0 right-1 text-black font-bold">{selectedAmount}</p>
        ) : null}
      </div>
      <p className="px-2 pt-1 rounded-b-lg text-sm truncate bg-light-default text-black font-bold text-center">
        {item.name}
      </p>

      {item.vision && visible && (
        <div
          className={clsx(
            "absolute -top-1 -right-1 p-1 flex-center rounded-full bg-black shadow-white-glow",
            item.cons !== undefined && "flex rounded-2xl pl-1.5"
          )}
        >
          {item.cons !== undefined && (
            <p className="mt-0.5 mr-1 text-sm font-semibold leading-none">C{item.cons}</p>
          )}
          <ElementIcon type={item.vision} />
        </div>
      )}
    </div>
  );
};

export const AppEntityOption = memo(AppEntityOptionCore, (prev, next) => {
  return prev.visible === next.visible && prev.selectedAmount === next.selectedAmount;
});
