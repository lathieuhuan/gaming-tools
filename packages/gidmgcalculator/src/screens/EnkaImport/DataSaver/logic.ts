import isEqual from "react-fast-compare";
import { Object_ } from "ron-utils";

import type { RawArtifact, RawCharacter, RawWeapon } from "@/types";

export const isExactCharacter = (character1: RawCharacter, character2: RawCharacter) => {
  return isEqual(
    Object_.extract(character1, ["level", "NAs", "ES", "EB", "cons"]),
    Object_.extract(character2, ["level", "NAs", "ES", "EB", "cons"])
  );
};

export const isSameWeapon = (weapon1: RawWeapon, weapon2: RawWeapon) => {
  return weapon1.code === weapon2.code;
};

export const isExactWeapon = (weapon1: RawWeapon, weapon2: RawWeapon) => {
  return isEqual(
    Object_.extract(weapon1, ["level", "refi"]),
    Object_.extract(weapon2, ["level", "refi"])
  );
};

export const isSameArtifact = (artifact1: RawArtifact, artifact2: RawArtifact) => {
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

export const isExactArtifact = (artifact1: RawArtifact, artifact2: RawArtifact) => {
  return isEqual(
    Object_.extract(artifact1, ["level", "subStats"]),
    Object_.extract(artifact2, ["level", "subStats"])
  );
};
