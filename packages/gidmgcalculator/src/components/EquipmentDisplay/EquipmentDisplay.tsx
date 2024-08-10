import { AdvancedPick, clsx, ItemCase, type ClassValue } from "rond";
import { AppArtifact, AppWeapon, ARTIFACT_TYPES } from "@Backend";

import { Artifact, Weapon } from "@Src/types";
import { $AppArtifact, $AppWeapon } from "@Src/services";
import { Utils_ } from "@Src/utils";

// Component
import { GenshinImage } from "../GenshinImage";
import { ItemThumbnail, type ItemThumbProps } from "../ItemThumbnail";

type ArtifactProps = AdvancedPick<Artifact, "code" | "type" | "rarity", "level">;

export interface EquipmentDisplayProps extends Pick<ItemThumbProps, "muted" | "compact" | "showOwner"> {
  className?: ClassValue;
  style?: React.CSSProperties;
  weapon: AdvancedPick<Weapon, "code" | "type", "level" | "refi">;
  appWeapon?: AppWeapon;
  artifacts?: (ArtifactProps | null)[];
  /** Whether empty artifacts are rendered as clickable buttons. */
  fillable?: boolean;
  onClickEmptyArtifact?: (itemIndex: number) => void;
  /** 0-4 is artifact, 5 is weapon, others is none */
  selectedIndex?: number;
  /** 0-4 is artifact, 5 is weapon */
  onClickItem?: (itemIndex: number) => void;
}
export function EquipmentDisplay(props: EquipmentDisplayProps) {
  const { weapon, appWeapon = $AppWeapon.get(weapon.code)!, artifacts = [], compact } = props;
  const EmptyWrap: keyof JSX.IntrinsicElements = props.fillable ? "button" : "div";

  const renderWeapon = (className?: string, imgCls?: string) => {
    return (
      <ItemThumbnail
        className={className}
        imgCls={imgCls}
        muted={props.muted}
        compact={compact}
        showOwner={props.showOwner}
        title={appWeapon.name}
        item={{
          icon: appWeapon.icon,
          rarity: appWeapon.rarity,
          ...weapon,
        }}
      />
    );
  };

  const renderArtifact = (
    artifact: ArtifactProps,
    appArtifactSet: AppArtifact,
    className?: string,
    imgCls?: string
  ) => {
    return (
      <ItemThumbnail
        className={className}
        imgCls={imgCls}
        title={appArtifactSet.name}
        muted={props.muted}
        compact={compact}
        showOwner={props.showOwner}
        item={{
          icon: appArtifactSet[artifact.type].icon,
          rarity: artifact.rarity,
          level: artifact.level,
        }}
      />
    );
  };

  return (
    <div className={clsx("flex flex-wrap", props.className)} style={props.style}>
      <div className="p-1.5 w-1/3">
        {props.muted ? (
          renderWeapon()
        ) : (
          <ItemCase chosen={props.selectedIndex === 5} onClick={() => props.onClickItem?.(5)}>
            {renderWeapon}
          </ItemCase>
        )}
      </div>

      {artifacts.map((artifact, i) => {
        const appArtifactSet = artifact ? $AppArtifact.getSet(artifact.code) : undefined;

        if (artifact && appArtifactSet) {
          return (
            <div key={i} className="p-1.5 w-1/3">
              {props.muted ? (
                renderArtifact(artifact, appArtifactSet)
              ) : (
                <ItemCase chosen={props.selectedIndex === i} onClick={() => props.onClickItem?.(i)}>
                  {(className, imgCls) => renderArtifact(artifact, appArtifactSet, className, imgCls)}
                </ItemCase>
              )}
            </div>
          );
        }

        return (
          <div key={i} className="p-1.5 w-1/3" style={{ minHeight: compact ? 84 : 124 }}>
            <EmptyWrap
              className={clsx("p-4 w-full h-full flex-center rounded bg-surface-3", props.fillable && " glow-on-hover")}
              onClick={props.fillable ? () => props.onClickEmptyArtifact?.(i) : undefined}
            >
              <GenshinImage className="w-full" src={Utils_.artifactIconOf(ARTIFACT_TYPES[i])} />
            </EmptyWrap>
          </div>
        );
      })}
    </div>
  );
}
