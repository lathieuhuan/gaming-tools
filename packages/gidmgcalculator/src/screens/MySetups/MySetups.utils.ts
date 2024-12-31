import { calculateSetup } from "@Backend";

import type { UserArtifacts, UserSetup, UserWeapon } from "@Src/types";
import { makeUICharacterRecord } from "@Src/utils/ui-character-record";

export function calculateChosenSetup(chosenSetup: UserSetup, weapon: UserWeapon | undefined, artifacts: UserArtifacts) {
  const { char, weaponID, artifactIDs, target, ...rest } = chosenSetup;

  if (weapon) {
    const result = calculateSetup({ char, weapon, artifacts, ...rest }, target);
    const characterRecord = makeUICharacterRecord(char, []);

    return {
      characterRecord,
      totalAttr: result.totalAttr,
      artAttr: result.artAttr,
      attkBonuses: result.attkBonuses,
      finalResult: result.finalResult,
    };
  }
}
