import { createContext } from "react";
import type { AppWeapon, ArtifactAttribute, ArtifactSetBonus, TotalAttribute } from "@Backend";
import type { Character, UserArtifacts, UserWeapon } from "@Src/types";
import type { UICharacterRecord } from "@Src/utils/ui-character-record";

export type DetailInfo = {
  character: Character;
  characterRecord: UICharacterRecord;
  weapon: UserWeapon;
  appWeapon: AppWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  totalAttr: TotalAttribute;
  artAttr: ArtifactAttribute;
};

export const DetailInfoContext = createContext<DetailInfo | null>(null);
