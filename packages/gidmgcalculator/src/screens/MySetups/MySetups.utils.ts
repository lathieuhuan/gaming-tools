import { calculateSetup, CharacterReadData } from "@Calculation";
import type { UserArtifacts, UserSetup, UserWeapon } from "@Src/types";

export function calculateChosenSetup(chosenSetup: UserSetup, weapon: UserWeapon | undefined, artifacts: UserArtifacts) {
  const { char, weaponID, artifactIDs, target, ...rest } = chosenSetup;

  if (weapon) {
    const result = calculateSetup({ char, weapon, artifacts, ...rest }, target);

    return {
      characterData: result.characterData as CharacterReadData,
      totalAttr: result.totalAttr,
      artAttr: result.artAttr,
      attkBonuses: result.attkBonuses,
      finalResult: result.finalResult,
    };
  }
}
