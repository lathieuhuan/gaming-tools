import isEqual from "react-fast-compare";
import { Object_ } from "ron-utils";

import type { IArtifactBasic, ICharacterBasic, IWeaponBasic } from "@/types";

export const isExactCharacter = (character1: ICharacterBasic, character2: ICharacterBasic) => {
  return isEqual(
    Object_.pickProps(character1, ["level", "NAs", "ES", "EB", "cons"]),
    Object_.pickProps(character2, ["level", "NAs", "ES", "EB", "cons"])
  );
};

export const isSameWeapon = (weapon1: IWeaponBasic, weapon2: IWeaponBasic) => {
  return weapon1.code === weapon2.code;
};

export const isExactWeapon = (weapon1: IWeaponBasic, weapon2: IWeaponBasic) => {
  return isEqual(
    Object_.pickProps(weapon1, ["level", "refi"]),
    Object_.pickProps(weapon2, ["level", "refi"])
  );
};

export const isSameArtifact = (artifact1: IArtifactBasic, artifact2: IArtifactBasic) => {
  const isSameGeneral =
    artifact1.code === artifact2.code &&
    artifact1.type === artifact2.type &&
    artifact1.rarity === artifact2.rarity &&
    artifact1.mainStatType === artifact2.mainStatType;

  const isSameSubStats = [1, 2, 3, 4].every((index) => {
    const subStat1 = artifact1.subStats[index];
    const subStat2 = artifact2.subStats[index];
    const isEmpty1 = !subStat1 || subStat1.value === 0;
    const isEmpty2 = !subStat2 || subStat2.value === 0;

    return (isEmpty1 && isEmpty2) || subStat1?.type === subStat2?.type;
  });

  return isSameGeneral && isSameSubStats;
};

export const isExactArtifact = (artifact1: IArtifactBasic, artifact2: IArtifactBasic) => {
  return isEqual(
    Object_.pickProps(artifact1, ["level", "subStats"]),
    Object_.pickProps(artifact2, ["level", "subStats"])
  );
};
