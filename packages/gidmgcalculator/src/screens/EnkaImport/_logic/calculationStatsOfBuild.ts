import { GenshinUserBuild } from "@/services/enka";
import { AppArtifactsByCode } from "@/types";
import Object_ from "@/utils/Object";
import { InputProcessor } from "@Calculation";

export function calculationStatsOfBuild(build: GenshinUserBuild) {
  const { character, weapon, artifacts } = build;

  const appArtifacts = artifacts.reduce<AppArtifactsByCode>((acc, artifact) => {
    const moreData = artifact?.code ? { [artifact.code]: artifact.data } : {};

    return Object_.assign(acc, moreData);
  }, {});

  const processor = new InputProcessor(
    {
      char: character,
      weapon,
      artifacts,
    },
    {
      appCharacters: {
        [character.name]: character.data,
      },
      appWeapons: {
        [weapon.code]: weapon.data,
      },
      appArtifacts: appArtifacts,
    }
  );

  return processor.getCalculationStats();
}
