import { clsx, ItemCase, type ClassValue } from "rond";

import type { ArtifactType } from "@/types";

import { Artifact, ArtifactGear, Weapon } from "@/models";

// Component
import { GenshinImage } from "../GenshinImage";
import { ItemThumbnail, type ItemThumbProps } from "../ItemThumbnail";

export type EquipmentType = "weapon" | ArtifactType;

export type EquipmentDisplayProps = Pick<ItemThumbProps, "muted" | "compact" | "showOwner"> & {
  className?: ClassValue;
  style?: React.CSSProperties;
  weapon: Weapon;
  atfGear: ArtifactGear;
  /** Whether empty artifacts are rendered as clickable buttons. */
  fillable?: boolean;
  selectedType?: EquipmentType;
  onClickItem?: (type: EquipmentType) => void;
  onFillAtfSlot?: (type: ArtifactType) => void;
};

export function EquipmentDisplay(props: EquipmentDisplayProps) {
  const { weapon, atfGear, selectedType, muted, showOwner, fillable, compact } = props;
  const EmptyWrap: keyof JSX.IntrinsicElements = fillable ? "button" : "div";

  return (
    <div className={clsx("flex flex-wrap", props.className)} style={props.style}>
      <div className="p-1.5 w-1/3">
        <ItemCase
          muted={muted}
          selected={selectedType === "weapon"}
          onClick={() => props.onClickItem?.("weapon")}
        >
          {(className, imgCls) => (
            <ItemThumbnail
              className={className}
              imgCls={imgCls}
              title={weapon.data.name}
              muted={muted}
              compact={compact}
              showOwner={showOwner}
              item={{
                icon: weapon.data.icon,
                rarity: weapon.data.rarity,
                level: weapon.level,
                refi: weapon.refi,
              }}
            />
          )}
        </ItemCase>
      </div>

      {atfGear.slots((slot) => {
        if (slot.isFilled) {
          const artifact = slot.piece;

          return (
            <div key={slot.type} className="p-1.5 w-1/3">
              <ItemCase
                muted={muted}
                selected={selectedType === slot.type}
                onClick={() => props.onClickItem?.(slot.type)}
              >
                {(className, imgCls) => (
                  <ItemThumbnail
                    className={className}
                    imgCls={imgCls}
                    title={artifact.data.name}
                    muted={muted}
                    compact={compact}
                    showOwner={showOwner}
                    item={{
                      icon: artifact.data[artifact.type].icon,
                      rarity: artifact.rarity,
                      level: artifact.level,
                    }}
                  />
                )}
              </ItemCase>
            </div>
          );
        }

        return (
          <div key={slot.type} className="p-1.5 w-1/3" style={{ minHeight: compact ? 84 : 124 }}>
            <EmptyWrap
              className={clsx(
                "p-4 w-full h-full flex-center rounded bg-dark-3",
                fillable && "glow-on-hover",
              )}
              onClick={fillable ? () => props.onFillAtfSlot?.(slot.type) : undefined}
            >
              <GenshinImage className="w-full" src={Artifact.iconOf(slot.type)} />
            </EmptyWrap>
          </div>
        );
      })}
    </div>
  );
}
