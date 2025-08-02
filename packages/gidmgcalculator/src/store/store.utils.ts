import { WeaponType } from "@Calculation";

import type { CalcWeapon, ModifierCtrl, UserArtifact, UserCharacter, UserWeapon } from "@Src/types";
import Modifier_ from "@Src/utils/modifier-utils";
import Entity_ from "@Src/utils/entity-utils";
import Array_ from "@Src/utils/array-utils";

export type CharacterForInit = Partial<UserCharacter> & {
  name: string;
};

type ParseUserCharacterArgs = {
  character: CharacterForInit;
  userWps: UserWeapon[];
  userArts: UserArtifact[];
  weaponType: WeaponType;
  seedID: number;
};
export function parseUserCharacter({
  character: { name, weaponID, artifactIDs = [null, null, null, null, null], ...info },
  userWps,
  userArts,
  weaponType,
  seedID,
}: ParseUserCharacterArgs) {
  const character = Entity_.createCharacter(name, info);

  let weapon: CalcWeapon;
  let wpBuffCtrls: ModifierCtrl[];
  const existedWeapon = Array_.findById(userWps, weaponID);

  if (existedWeapon) {
    weapon = Entity_.userItemToCalcItem(existedWeapon, seedID++);
    wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, existedWeapon);
  } //
  else {
    const newWeapon = Entity_.createWeapon({ type: weaponType }, seedID++);
    weapon = newWeapon;
    wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, newWeapon);
  }

  const artifacts = artifactIDs.map((id) => {
    const artifact = id ? Array_.findById(userArts, id) : undefined;
    return artifact ? Entity_.userItemToCalcItem(artifact, seedID++) : null;
  });
  const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(artifacts);

  return {
    character,
    weapon,
    wpBuffCtrls,
    artifacts,
    artBuffCtrls,
  };
}
