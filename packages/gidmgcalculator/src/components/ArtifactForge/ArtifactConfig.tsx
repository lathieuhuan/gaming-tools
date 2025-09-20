import { useEffect, useRef } from "react";
import { Rarity } from "rond";

import type { Artifact } from "@/types";
import Object_ from "@/utils/Object";

import { ArtifactCard, ArtifactCardProps, type ArtifactCardAction } from "@/components/ArtifactCard";

type Mousedown = (e: KeyboardEvent) => void;

type ArtifactConfigProps = {
  config?: Artifact;
  typeSelect?: React.ReactNode;
  maxRarity?: number;
  batchConfigNode?: React.ReactNode;
  /** Default to 'Forge' */
  mainActionLabel?: string;
  moreButtons?: ArtifactCardAction[];
  onRarityChange?: (rarity: number) => void;
  onConfigUpdate?: (properties: Partial<Artifact>) => void;
  onSelect?: (config: Artifact) => void;
};

export function ArtifactConfig({
  config,
  typeSelect,
  maxRarity = 5,
  batchConfigNode,
  mainActionLabel = "Forge",
  moreButtons = [],
  onRarityChange,
  onConfigUpdate,
  onSelect,
}: ArtifactConfigProps) {
  const mouseDown = useRef<Mousedown>(() => null);

  mouseDown.current = (e: KeyboardEvent) => {
    if (e.key === "Enter" && document.activeElement instanceof HTMLBodyElement && config) {
      onSelect?.(config);
    }
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      mouseDown.current(e);
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleRarityChange = (num: number) => {
    if (num !== config?.rarity) {
      onRarityChange?.(num);
    }
  };

  const handleSubStatChange: ArtifactCardProps["onChangeSubStat"] = (index, changes, artifact) => {
    const subStats = Object_.clone(artifact.subStats);
    subStats[index] = Object_.assign(subStats[index], changes);

    onConfigUpdate?.({ subStats });
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
              onChange={handleRarityChange}
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
              onConfigUpdate?.({ level });
            }}
            onChangeMainStatType={(mainStatType) => {
              onConfigUpdate?.({ mainStatType });
            }}
            onChangeSubStat={(index, changes, artifact) => {
              handleSubStatChange(index, changes, artifact);
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
