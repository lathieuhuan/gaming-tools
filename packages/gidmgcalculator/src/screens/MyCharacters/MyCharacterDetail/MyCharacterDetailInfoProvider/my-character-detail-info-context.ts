import { createContext, useContext } from "react";
import { AppWeapon, ArtifactAttribute, ArtifactSetBonus, TotalAttribute } from "@Backend";

import type { Character, UserArtifacts, UserWeapon } from "@Src/types";
import { UICharacterRecord } from "@Src/utils/ui-character-record";

type MyCharacterDetailInfo = {
  character: Character;
  characterRecord: UICharacterRecord;
  weapon: UserWeapon;
  appWeapon: AppWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  totalAttr: TotalAttribute;
  artAttr: ArtifactAttribute;
};

export type MyCharacterDetailInfoState = {
  loading: boolean;
  data: MyCharacterDetailInfo | null;
};

export const MyCharacterDetailInfoContext = createContext<MyCharacterDetailInfoState>({ loading: true, data: null });

export function useMyCharacterDetailInfo() {
  return useContext(MyCharacterDetailInfoContext);
}
