import { useState } from "react";
import { clsx, ItemCase, type ClassValue } from "rond";
import { AppWeapon, ARTIFACT_TYPES } from "@Backend";

import { Artifact, Weapon } from "@Src/types";
import { $AppArtifact, $AppWeapon } from "@Src/services";
import { Utils_ } from "@Src/utils";

// Component
import { GenshinImage } from "../GenshinImage";
import { ItemThumbnail } from "../ItemThumbnail";

interface EquipmentDisplayProps {
  className?: ClassValue;
  weapon: Weapon;
  appWeapon?: AppWeapon;
  artifacts?: (Artifact | null)[];
  compact?: boolean;
  highlightable?: boolean;
  /** 0-4 is artifact, 5 is weapon */
  onClickItem?: (itemIndex: number) => void;
}
export function EquipmentDisplay(props: EquipmentDisplayProps) {
  const [chosenIndex, setChosenIndex] = useState(-1);

  const { weapon, appWeapon = $AppWeapon.get(weapon.code)!, artifacts = [], compact } = props;

  const onClickItem = (itemIndex: number) => {
    if (props.highlightable) {
      setChosenIndex(itemIndex);
    }
    props.onClickItem?.(itemIndex);
  };

  return (
    <div className={clsx("flex flex-wrap", props.className)}>
      <div className="p-1.5 w-1/3">
        <ItemCase chosen={chosenIndex === 5} onClick={() => onClickItem(5)}>
          {(className, imgCls) => (
            <ItemThumbnail
              className={className}
              imgCls={imgCls}
              compact={compact}
              title={appWeapon.name}
              item={{
                beta: appWeapon.beta,
                icon: appWeapon.icon,
                rarity: appWeapon.rarity,
                ...weapon,
              }}
            />
          )}
        </ItemCase>
      </div>

      {artifacts.map((artifact, i) => {
        const appArtifactSet = artifact ? $AppArtifact.getSet(artifact.code) : undefined;

        if (artifact && appArtifactSet) {
          return (
            <div key={i} className="p-1.5 w-1/3">
              <ItemCase chosen={chosenIndex === i} onClick={() => onClickItem(i)}>
                {(className, imgCls) => (
                  <ItemThumbnail
                    className={className}
                    imgCls={imgCls}
                    title={appArtifactSet.name}
                    compact={compact}
                    item={{
                      rarity: artifact.rarity,
                      level: artifact.level,
                      icon: appArtifactSet[artifact.type].icon,
                    }}
                  />
                )}
              </ItemCase>
            </div>
          );
        }

        return (
          <div key={i} className="p-1.5 w-1/3" style={{ minHeight: compact ? 84 : 124 }}>
            <div className="p-4 w-full h-full flex-center rounded bg-surface-3">
              <GenshinImage className="w-full" src={Utils_.artifactIconOf(ARTIFACT_TYPES[i])} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
