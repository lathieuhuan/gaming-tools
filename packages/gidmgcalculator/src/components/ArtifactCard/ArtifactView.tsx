import { clsx, Badge, VersatileSelect } from "rond";
import { ArtifactCalc, AttributeStat } from "@Calculation";

import type { ArtifactSubStat, CalcArtifact, UserArtifact } from "@/types";
import { useTranslation } from "@/hooks";
import { $AppArtifact } from "@/services";
import { suffixOf } from "@/utils";

// Component
import { ArtifactLevelSelect } from "./ArtifactLevelSelect";
import { ArtifactSubstatsControl } from "./ArtifactSubstatsControl";
import { GenshinImage } from "../GenshinImage";

export interface ArtifactViewProps<T extends CalcArtifact | UserArtifact> {
  mutable?: boolean;
  className?: string;
  artifact?: T;
  action?: React.ReactNode;
  onEnhance?: (level: number, artifact: T) => void;
  onChangeMainStatType?: (type: AttributeStat, artifact: T) => void;
  onChangeSubStat?: (index: number, changes: Partial<ArtifactSubStat>, artifact: T) => void;
}
export function ArtifactView<T extends CalcArtifact | UserArtifact>({
  className,
  artifact,
  mutable,
  action,
  onEnhance,
  onChangeMainStatType,
  onChangeSubStat,
}: ArtifactViewProps<T>) {
  const { t } = useTranslation();
  if (!artifact) return null;

  const appArtifact = $AppArtifact.get(artifact);
  const { rarity = 5, mainStatType } = artifact;
  const possibleMainStatTypes = ArtifactCalc.possibleMainStatTypesOf(artifact.type);
  const mainStatValue = ArtifactCalc.mainStatValueOf(artifact);

  return (
    <div className={className}>
      <div className={`bg-rarity-${rarity} flex items-center`}>
        <p
          className="mr-auto pl-4 pr-2 py-0.5 text-lg font-semibold text-black truncate"
          onDoubleClick={() => console.log(artifact)}
        >
          {appArtifact?.name}
        </p>
        {action}
      </div>

      <div className="mt-4 px-3 flex justify-between items-start">
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

      <div className="mt-1 ml-6 flex flex-col">
        {["flower", "plume"].includes(artifact.type) || !mutable ? (
          <p className={"py-1 text-lg " + (mutable ? "pl-6" : "pl-2")}>{t(mainStatType)}</p>
        ) : (
          <VersatileSelect
            title="Select Main-stat"
            className="w-48 h-9 text-lg"
            transparent
            arrowAt="start"
            options={possibleMainStatTypes.map((type) => ({ label: t(type), value: type }))}
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
      />
    </div>
  );
}
