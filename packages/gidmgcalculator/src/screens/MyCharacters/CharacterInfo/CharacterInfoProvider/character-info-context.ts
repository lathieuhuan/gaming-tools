import { createContext, useContext } from "react";
import { AppCharacter, AppWeapon, ArtifactAttribute, ArtifactSetBonus, TotalAttribute } from "@Backend";

import type { Character, UserArtifacts, UserWeapon } from "@Src/types";

type CharacterInfoData = {
  char: Character;
  appChar: AppCharacter;
  weapon: UserWeapon;
  appWeapon: AppWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  totalAttr: TotalAttribute;
  artAttr: ArtifactAttribute;
};

export type CharacterInfoState = {
  loading: boolean;
  data: CharacterInfoData | null;
};

export const CharacterInfoContext = createContext<CharacterInfoState>({ loading: true, data: null });

export function useCharacterInfo() {
  return useContext(CharacterInfoContext);
}
