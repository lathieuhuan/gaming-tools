import { createContext } from "react";
import type { AppWeapon, ArtifactAttribute, ArtifactSetBonus, CalcTeamData, TotalAttribute } from "@Calculation";
import type { Character, UserArtifacts, UserWeapon } from "@/types";

export type DetailInfo = {
  character: Character;
  teamData: CalcTeamData;
  weapon: UserWeapon;
  appWeapon: AppWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  totalAttr: TotalAttribute;
  artAttr: ArtifactAttribute;
};

export const DetailInfoContext = createContext<DetailInfo | null>(null);
