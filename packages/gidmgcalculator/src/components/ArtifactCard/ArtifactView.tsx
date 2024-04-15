import { useRef } from "react";
import { clsx, Badge, Select } from "rond";

import type { ArtifactSubStat, AttributeStat, CalcArtifact, UserArtifact } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppData } from "@Src/services";
import { suffixOf, Artifact_ } from "@Src/utils";

// Component
import { ArtifactLevelSelect } from "./ArtifactLevelSelect";
import { ArtifactSubstatsControl } from "./ArtifactSubstatsControl";
import { GenshinImage } from "../GenshinImage";

export interface ArtifactViewProps<T extends CalcArtifact | UserArtifact> {
  mutable?: boolean;
  className?: string;
  artifact?: T;
  onEnhance?: (level: number, artifact: T) => void;
  onChangeMainStatType?: (type: AttributeStat, artifact: T) => void;
  onChangeSubStat?: (index: number, changes: Partial<ArtifactSubStat>, artifact: T) => void;
}
export function ArtifactView<T extends CalcArtifact | UserArtifact>({
  className,
  artifact,
  mutable,
  onEnhance,
  onChangeMainStatType,
  onChangeSubStat,
}: ArtifactViewProps<T>) {
  const { t } = useTranslation();
  const wrapElmt = useRef<HTMLDivElement>(null);
  if (!artifact) return null;

  const appArtifact = $AppData.getArtifact(artifact);
  const { rarity = 5, mainStatType } = artifact;
  const possibleMainStatTypes = Artifact_.possibleMainStatTypesOf(artifact.type);
  const mainStatValue = Artifact_.mainStatValueOf(artifact);

  return (
    <div ref={wrapElmt} className={className}>
      <div className={`px-4 pt-1 bg-rarity-${rarity}`} onDoubleClick={() => console.log(artifact)}>
        <p className="text-lg font-semibold text-black truncate">{appArtifact?.name}</p>
      </div>

      <div className="mt-4 px-4 flex justify-between items-start">
        <ArtifactLevelSelect
          mutable={mutable}
          rarity={rarity}
          level={artifact.level}
          maxLevel={rarity === 5 ? 20 : 16}
          onChangeLevel={(level) => onEnhance?.(level, artifact)}
        />

        <div className={`bg-gradient-${rarity} relative rounded-lg shrink-0`}>
          <GenshinImage
            src={appArtifact?.icon}
            alt={appArtifact?.name}
            className="p-2"
            imgType="artifact"
            width={104}
            height={104}
            fallbackCls="p-2"
          />
          <Badge active={appArtifact?.beta} className="absolute bottom-0 right-0">
            BETA
          </Badge>
        </div>
      </div>

      <div className="mt-2 ml-6">
        {["flower", "plume"].includes(artifact.type) || !mutable ? (
          <p className={"py-1 text-lg " + (mutable ? "pl-6" : "pl-2")}>{t(mainStatType)}</p>
        ) : (
          <Select
            className="w-48 h-9 text-lg"
            transparent
            arrowAt="start"
            options={possibleMainStatTypes.map((type) => ({ label: t(type), value: type }))}
            getPopupContainer={() => wrapElmt.current!}
            value={mainStatType}
            onChange={(value) => onChangeMainStatType?.(value as AttributeStat, artifact)}
          />
        )}
        <p className={clsx(`text-rarity-${rarity} text-2xl leading-7 font-bold`, mutable ? "pl-6" : "pl-2")}>
          {mainStatValue}
          {suffixOf(mainStatType)}
        </p>
      </div>

      <ArtifactSubstatsControl
        className="mt-2"
        mutable={mutable}
        rarity={rarity}
        mainStatType={mainStatType}
        subStats={artifact.subStats}
        onChangeSubStat={(...args) => onChangeSubStat?.(...args, artifact)}
        getContainer={() => wrapElmt.current!}
      />
    </div>
  );
}
