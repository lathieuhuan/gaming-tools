import { WeaponType } from "@Calculation";

import type { CalcWeapon, IUserArtifact, UserCharacter, IUserWeapon } from "@/types";
import Array_ from "@/utils/Array";
import Entity_ from "@/utils/Entity";

export type CharacterForInit = Partial<UserCharacter> & {
  name: string;
};

type ParseUserCharacterArgs = {
  character: CharacterForInit;
  userWps: IUserWeapon[];
  userArts: IUserArtifact[];
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
  const existedWeapon = Array_.findById(userWps, weaponID);

  if (existedWeapon) {
    weapon = Entity_.userItemToCalcItem(existedWeapon, seedID++);
  } //
  else {
    const newWeapon = Entity_.createWeapon({ type: weaponType }, seedID++);
    weapon = newWeapon;
  }

  const artifacts = artifactIDs.map((id) => {
    const artifact = id ? Array_.findById(userArts, id) : undefined;
    return artifact ? Entity_.userItemToCalcItem(artifact, seedID++) : null;
  });

  return {
    character,
    weapon,
    artifacts,
  };
}
