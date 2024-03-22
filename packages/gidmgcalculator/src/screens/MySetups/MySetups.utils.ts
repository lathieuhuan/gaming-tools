import type { UserArtifacts, UserSetup, UserWeapon } from "@Src/types";
import { calculateSetup } from "@Src/calculation";
import { $AppCharacter } from "@Src/services";

export function calculateChosenSetup(chosenSetup: UserSetup, weapon: UserWeapon | null, artifacts: UserArtifacts) {
  const { char, weaponID, artifactIDs, target, ...rest } = chosenSetup;
  const appChar = $AppCharacter.get(char.name);

  if (appChar && weapon) {
    const result = calculateSetup({ char, weapon, artifacts, ...rest }, target);

    return {
      appChar,
      totalAttr: result.totalAttr,
      artAttr: result.artAttr,
      rxnBonus: result.rxnBonus,
      finalResult: result.finalResult,
      infusedElement: result.infusedElement,
    };
  }
}
