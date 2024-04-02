import { createContext, useContext } from "react";
import type {
  AppCharacter,
  AppWeapon,
  ArtifactAttribute,
  ArtifactSetBonus,
  Character,
  TotalAttribute,
  UserArtifacts,
  UserWeapon,
} from "@Src/types";

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
