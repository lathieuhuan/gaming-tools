import { GeneralCalc, WeaponType } from "@Backend";

import type { CalcWeapon, ModifierCtrl, UserArtifact, UserCharacter, UserWeapon } from "@Src/types";
import { Utils_, Modifier_, findById } from "@Src/utils";

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
  const char = Utils_.createCharacter(name, info);

  let weapon: CalcWeapon;
  let wpBuffCtrls: ModifierCtrl[];
  const existedWeapon = findById(userWps, weaponID);

  if (existedWeapon) {
    weapon = Utils_.userItemToCalcItem(existedWeapon, seedID++);
    wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, existedWeapon);
  } //
  else {
    const newWeapon = Utils_.createWeapon({ type: weaponType }, seedID++);
    weapon = newWeapon;
    wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, newWeapon);
  }

  const artifacts = artifactIDs.map((id) => {
    const artifact = id ? findById(userArts, id) : undefined;
    return artifact ? Utils_.userItemToCalcItem(artifact, seedID++) : null;
  });
  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(setBonuses);

  return {
    char,
    weapon,
    wpBuffCtrls,
    artifacts,
    artBuffCtrls,
  };
}
