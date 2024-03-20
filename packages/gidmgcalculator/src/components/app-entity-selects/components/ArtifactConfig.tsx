import { Rarity } from "rond";

import type { Artifact } from "@Src/types";
import { deepCopy } from "@Src/utils";
import { ArtifactCard, ArtifactCardAction } from "../../ArtifactCard";

interface ArtifactConfigProps {
  config?: Artifact;
  typeSelect?: React.ReactNode;
  maxRarity?: number;
  batchConfigNode?: React.ReactNode;
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
            <Rarity
              className="gap-4"
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
