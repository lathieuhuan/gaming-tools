import { clsx, ItemCase } from "rond";

import { GenshinImage, ItemThumbnail } from "@/components";
import { ConvertedArtifact } from "@/services";
import Entity_ from "@/utils/Entity";
import { ARTIFACT_TYPES, ArtifactType } from "@Calculation";
import { SelectedBuild } from "../types";

type BuildArtifactProps = {
  className?: string;
  artifact?: ConvertedArtifact | null;
  selectedBuild?: SelectedBuild;
  artifactType: ArtifactType;
  showLevel?: boolean;
  onClick?: () => void;
};

export function BuildArtifact({
  className,
  artifact,
  selectedBuild,
  artifactType,
  showLevel = true,
  onClick,
}: BuildArtifactProps) {
  if (!artifact) {
    return (
      <div className={clsx("p-2 bg-dark-3 rounded opacity-50", className)}>
        <GenshinImage className="w-full" src={Entity_.artifactIconOf(artifactType)} />
      </div>
    );
  }

  const index = ARTIFACT_TYPES.indexOf(artifactType);
  const icon = artifact.data[artifactType].icon;
  const selected =
    selectedBuild?.detailType === index && selectedBuild?.artifacts[index]?.ID === artifact.ID;

  return (
    <ItemCase className={clsx("grow", className)} chosen={selected} onClick={onClick}>
      {(className, imgCls) => (
        <ItemThumbnail
          className={className}
          imgCls={imgCls}
          item={{
            icon,
            level: showLevel ? artifact.level : undefined,
            rarity: artifact.rarity,
          }}
          compact
        />
      )}
    </ItemCase>
  );
}
