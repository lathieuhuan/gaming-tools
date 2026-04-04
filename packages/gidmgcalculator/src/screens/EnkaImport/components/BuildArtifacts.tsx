import { clsx, ItemCase } from "rond";

import type { ArtifactType } from "@/types";
import type { SelectedBuild } from "../types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { Artifact } from "@/models";
import { GenshinUserBuild } from "@/services/enka";
import { useSelectedBuildState } from "../DataImporter";

import { GenshinImage, ItemThumbnail } from "@/components";

type BuildArtifactProps = {
  className?: string;
  artifact?: Artifact;
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

  const selectedArtifact = selectedBuild?.atfGear.pieces.get(artifactType);
  const selected =
    selectedBuild?.detailType === artifactType && selectedArtifact?.ID === artifact.ID;

  return (
    <ItemCase className={clsx("grow", className)} selected={selected} onClick={onClick}>
      {(className, imgCls) => (
        <ItemThumbnail
          className={className}
          imgCls={imgCls}
          item={{
            icon: artifact.icon,
            level: showLevel ? selectedArtifact?.level : undefined,
            rarity: selectedArtifact?.rarity,
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
      {ARTIFACT_TYPES.map((type) => (
        <BuildArtifact
          key={type}
          showLevel={showLevel}
          artifact={build.atfGear.pieces.get(type)}
          selectedBuild={selectedBuild}
          artifactType={type}
          onClick={() => setSelectedBuild({ ...build, detailType: type })}
        />
      ))}
    </>
  );
}
