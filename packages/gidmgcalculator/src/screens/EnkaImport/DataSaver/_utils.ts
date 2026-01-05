import isEqual from "react-fast-compare";

import type { IArtifactBasic, IWeaponBasic } from "@/types";
import Object_ from "@/utils/Object";

export const isExactWeapon = (weapon1: IWeaponBasic, weapon2: IWeaponBasic) => {
  return isEqual(
    Object_.pickProps(weapon1, ["level", "refi"]),
    Object_.pickProps(weapon2, ["level", "refi"])
  );
};

export const isExactArtifact = (artifact1: IArtifactBasic, artifact2: IArtifactBasic) => {
  return isEqual(
    Object_.pickProps(artifact1, ["level", "subStats"]),
    Object_.pickProps(artifact2, ["level", "subStats"])
  );
};
