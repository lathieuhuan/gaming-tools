import { Rarity } from "rond";

import type { Artifact } from "@Src/types";
import Object_ from "@Src/utils/object-utils";
import { ArtifactCard, type ArtifactCardAction } from "../../ArtifactCard";

interface ArtifactConfigProps {
  config?: Artifact;
  typeSelect?: React.ReactNode;
  maxRarity?: number;
  batchConfigNode?: React.ReactNode;
  /** Default to 'Forge' */
  mainActionLabel?: string;
  moreButtons?: ArtifactCardAction[];
  onChangeRarity?: (rarity: number) => void;
  onUpdateConfig?: (properties: Partial<Artifact>) => void;
  onSelect?: (config: Artifact) => void;
}
export function ArtifactConfig({
  config,
  typeSelect,
  maxRarity = 5,
  batchConfigNode,
  mainActionLabel = "Forge",
  moreButtons = [],
  onChangeRarity,
  onUpdateConfig,
  onSelect,
}: ArtifactConfigProps) {
  const onClickRarityStar = (num: number) => {
    if (num !== config?.rarity) {
      onChangeRarity?.(num);
    }
  };

  return (
    <div className="h-full flex flex-col custom-scrollbar space-y-3">
      {config ? (
        <div className="px-2 space-y-4">
          <div className="flex items-start justify-between">
            <label className="h-8 flex items-center text-sm">Rarity</label>
            <Rarity
              className="gap-4 w-56"
              value={config.rarity}
              mutable={{ min: 4, max: maxRarity }}
              onChange={onClickRarityStar}
            />
          </div>

          {typeSelect ? (
            <div className="flex items-start justify-between">
              <label className="h-8 flex items-center text-sm">Type</label>
              {typeSelect}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grow w-76 hide-scrollbar">
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
              const subStats = Object_.clone(artifact.subStats);
              subStats[index] = Object.assign(subStats[index], changes);
              onUpdateConfig?.({ subStats });
            }}
            actions={[
              ...moreButtons,
              {
                children: mainActionLabel,
                variant: "primary",
                onClick: (_, config) => onSelect?.(config),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
