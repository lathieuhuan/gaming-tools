import { createContext } from "react";
import type { AppWeapon, ArtifactAttribute, ArtifactSetBonus, CharacterReadData, TotalAttribute } from "@Backend";
import type { Character, UserArtifacts, UserWeapon } from "@Src/types";

export type DetailInfo = {
  character: Character;
  characterData: CharacterReadData;
  weapon: UserWeapon;
  appWeapon: AppWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  totalAttr: TotalAttribute;
  artAttr: ArtifactAttribute;
};

export const DetailInfoContext = createContext<DetailInfo | null>(null);
