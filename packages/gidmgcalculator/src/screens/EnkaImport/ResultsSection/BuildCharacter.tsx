import { ItemCase } from "rond";

import { CharacterPortrait } from "@/components";
import { GenshinUserBuild } from "@/services/enka";
import { useSelectedBuildState } from "../DataImportProvider";

type BuildCharacterProps = {
  build: GenshinUserBuild;
};

export function BuildCharacter({ build }: BuildCharacterProps) {
  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();
  const { data } = build.character;

  const selected =
    data.name === selectedBuild?.character.data.name && selectedBuild?.detailType === "CHARACTER";

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
          info={{ icon: data.icon }}
        />
      )}
    </ItemCase>
  );
}
