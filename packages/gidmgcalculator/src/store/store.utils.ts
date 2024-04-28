import { GeneralCalc, WeaponType } from "@Backend";

import type { CalcWeapon, ModifierCtrl, UserArtifact, UserCharacter, UserWeapon } from "@Src/types";
import { Character_, Modifier_, Weapon_, Item_, findById } from "@Src/utils";

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
  const char = Character_.create(name, info);

  let weapon: CalcWeapon;
  let wpBuffCtrls: ModifierCtrl[];
  const existedWeapon = findById(userWps, weaponID);

  if (existedWeapon) {
    weapon = Item_.userItemToCalcItem(existedWeapon, seedID++);
    wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, existedWeapon);
  } //
  else {
    const newWeapon = Weapon_.create({ type: weaponType }, seedID++);
    weapon = newWeapon;
    wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, newWeapon);
  }

  const artifacts = artifactIDs.map((id) => {
    const artifact = id ? findById(userArts, id) : undefined;
    return artifact ? Item_.userItemToCalcItem(artifact, seedID++) : null;
  });
  const firstSetBonus = GeneralCalc.getArtifactSetBonuses(artifacts)[0];

  return {
    char,
    weapon,
    wpBuffCtrls,
    artifacts,
    artBuffCtrls: firstSetBonus?.bonusLv ? Modifier_.createArtifactBuffCtrls(true, firstSetBonus) : [],
  };
}
