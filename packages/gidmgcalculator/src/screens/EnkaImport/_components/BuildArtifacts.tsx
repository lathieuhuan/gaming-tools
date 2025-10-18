import { ARTIFACT_TYPES } from "@Calculation";
import { clsx, ItemCase } from "rond";

import { GenshinImage, ItemThumbnail } from "@/components";
import { GenshinUserBuild } from "@/services/enka";
import Entity_ from "@/utils/Entity";
import { useSelectedBuildState } from "../SelectedBuildProvider";

type BuildArtifactsProps = {
  className?: string;
  /** Default true */
  showLevel?: boolean;
  build: GenshinUserBuild;
};

export function BuildArtifacts({ className, showLevel = true, build }: BuildArtifactsProps) {
  const { artifacts } = build;

  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  return (
    <div className={clsx("flex gap-2", className)}>
      {artifacts.map((artifact, index) => {
        if (artifact) {
          const icon = artifact.data[artifact.type].icon;
          const selected =
            selectedBuild?.detailType === index &&
            selectedBuild?.artifacts[index]?.ID === artifact.ID;

          return (
            <ItemCase
              key={index}
              className="grow"
              chosen={selected}
              onClick={() => setSelectedBuild({ ...build, detailType: index })}
            >
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

        return (
          <div key={index} className="size-14 p-2 bg-dark-3 rounded opacity-50">
            <GenshinImage className="w-full" src={Entity_.artifactIconOf(ARTIFACT_TYPES[index])} />
          </div>
        );
      })}
    </div>
  );
}
