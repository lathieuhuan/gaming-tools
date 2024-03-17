import type { ReactNode } from "react";
import { clsx, StarSvg } from "rond";

import type { Artifact } from "@Src/types";
import { deepCopy } from "@Src/utils";
import { ArtifactCard, ArtifactCardAction } from "../../ArtifactCard";

interface ArtifactConfigProps {
  config?: Artifact;
  typeSelect?: ReactNode;
  maxRarity?: number;
  batchConfigNode?: ReactNode;
  moreButtons?: ArtifactCardAction[];
  onChangeRarity?: (rarity: number) => void;
  onUpdateConfig?: (properties: Partial<Artifact>) => void;
  onSelect?: (config: Artifact) => void;
}
export const ArtifactConfig = ({
  config,
  typeSelect,
  maxRarity = 5,
  batchConfigNode,
  moreButtons = [],
  onChangeRarity,
  onUpdateConfig,
  onSelect,
}: ArtifactConfigProps) => {
  const onClickRarityStar = (num: number) => {
    if (num !== config?.rarity) {
      onChangeRarity?.(num);
    }
  };

  return (
    <div className="h-full flex flex-col custom-scrollbar space-y-4">
      {config ? (
        <div className="px-2 space-y-4">
          <div className="flex items-start justify-between">
            <label className="h-8 flex items-center text-sm">Rarity</label>
            <div className="flex gap-4">
              {Array.from({ length: 5 }, (_, num) => {
                const rarity = num + 1;
                const disabled = rarity < 4;

                return num < maxRarity ? (
                  <button
                    key={num}
                    className={clsx(
                      "w-8 h-8 flex-center text-3xl",
                      disabled && "opacity-50",
                      config.rarity >= rarity ? `text-rarity-${config.rarity}` : "text-rarity-1"
                    )}
                    disabled={disabled}
                    onClick={() => onClickRarityStar(rarity)}
                  >
                    <StarSvg />
                  </button>
                ) : (
                  <div className="w-8 h-8 shrink-0" />
                );
              })}
            </div>
          </div>

          {typeSelect ? (
            <div className="flex items-start justify-between">
              <label className="h-8 flex items-center text-sm">Type</label>
              {typeSelect}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grow hide-scrollbar" style={{ width: "19.5rem" }}>
        {batchConfigNode ?? (
          <ArtifactCard
            wrapperCls="h-full"
            mutable
            artifact={config}
            onEnhance={(level) => {
              onUpdateConfig?.({ level });
            }}
            onChangeMainStatType={(mainStatType) => {
              onUpdateConfig?.({ mainStatType });
            }}
            onChangeSubStat={(index, changes, artifact) => {
              const subStats = deepCopy(artifact.subStats);
              subStats[index] = Object.assign(subStats[index], changes);
              onUpdateConfig?.({ subStats });
            }}
            actions={[
              ...moreButtons,
              {
                children: "Forge",
                variant: "primary",
                onClick: (_, config) => onSelect?.(config),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};
