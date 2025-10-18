import { ItemCase } from "rond";

import { CharacterPortrait } from "@/components";
import { GenshinUserBuild } from "@/services/enka";
import { useSelectedBuildState } from "../SelectedBuildProvider";

type BuildCharacterProps = {
  build: GenshinUserBuild;
};

export function BuildCharacter({ build }: BuildCharacterProps) {
  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  const selected =
    build.character.name === selectedBuild?.character.name &&
    selectedBuild?.detailType === "CHARACTER";

  return (
    <ItemCase
      chosen={selected}
      onClick={() => setSelectedBuild({ ...build, detailType: "CHARACTER" })}
    >
      {(className, imgCls) => (
        <CharacterPortrait
          className={className}
          imgCls={imgCls}
          zoomable
          info={{ icon: build.character.data.icon }}
        />
      )}
    </ItemCase>
  );
}
