import { clsx, ItemCase } from "rond";

import type { ArtifactType, IArtifact } from "@/types";
import type { SelectedBuild } from "../types";

import { ARTIFACT_TYPES } from "@/constants";
import { Artifact } from "@/models/base";
import { GenshinUserBuild } from "@/services/enka";
import { useSelectedBuildState } from "../DataImportProvider";

import { GenshinImage, ItemThumbnail } from "@/components";

type BuildArtifactProps = {
  className?: string;
  artifact?: IArtifact | null;
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
        <GenshinImage className="w-full" src={Artifact.iconOf(artifactType)} />
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

type BuildArtifactsProps = {
  build: GenshinUserBuild;
  showLevel?: boolean;
};

export function BuildArtifacts({ build, showLevel }: BuildArtifactsProps) {
  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  return (
    <>
      {build.artifacts.map((artifact, index) => (
        <BuildArtifact
          key={index}
          showLevel={showLevel}
          artifact={artifact}
          selectedBuild={selectedBuild}
          artifactType={ARTIFACT_TYPES[index]}
          onClick={() => setSelectedBuild({ ...build, detailType: index })}
        />
      ))}
    </>
  );
}
