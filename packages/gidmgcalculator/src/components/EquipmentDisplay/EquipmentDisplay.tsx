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
  onClickEmptyAtfSlot?: (type: ArtifactType) => void;
};

export function EquipmentDisplay(props: EquipmentDisplayProps) {
  const { weapon, atfGear, selectedType, muted, showOwner, fillable, compact } = props;
  const EmptyWrap: keyof JSX.IntrinsicElements = fillable ? "button" : "div";

  const renderWeapon = (className?: string, imgCls?: string) => {
    return (
      <ItemThumbnail
        className={className}
        imgCls={imgCls}
        muted={muted}
        compact={compact}
        showOwner={showOwner}
        title={weapon.data.name}
        item={{
          icon: weapon.data.icon,
          rarity: weapon.data.rarity,
          level: weapon.level,
          refi: weapon.refi,
        }}
      />
    );
  };

  const renderArtifact = (artifact: Artifact, className?: string, imgCls?: string) => {
    return (
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
    );
  };

  return (
    <div className={clsx("flex flex-wrap", props.className)} style={props.style}>
      <div className="p-1.5 w-1/3">
        {muted ? (
          renderWeapon()
        ) : (
          <ItemCase
            selected={selectedType === "weapon"}
            onClick={() => props.onClickItem?.("weapon")}
          >
            {renderWeapon}
          </ItemCase>
        )}
      </div>

      {atfGear.slots((slot) => {
        if (slot.isFilled) {
          return (
            <div key={slot.type} className="p-1.5 w-1/3">
              {muted ? (
                renderArtifact(slot.piece)
              ) : (
                <ItemCase
                  selected={selectedType === slot.type}
                  onClick={() => props.onClickItem?.(slot.type)}
                >
                  {(className, imgCls) => renderArtifact(slot.piece, className, imgCls)}
                </ItemCase>
              )}
            </div>
          );
        }

        return (
          <div key={slot.type} className="p-1.5 w-1/3" style={{ minHeight: compact ? 84 : 124 }}>
            <EmptyWrap
              className={clsx(
                "p-4 w-full h-full flex-center rounded bg-dark-3",
                fillable && "glow-on-hover"
              )}
              onClick={fillable ? () => props.onClickEmptyAtfSlot?.(slot.type) : undefined}
            >
              <GenshinImage className="w-full" src={Artifact.iconOf(slot.type)} />
            </EmptyWrap>
          </div>
        );
      })}
    </div>
  );
}
