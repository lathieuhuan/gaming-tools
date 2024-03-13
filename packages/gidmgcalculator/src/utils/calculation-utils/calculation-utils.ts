import type { AppCharacter, Character, PartyData, Talent } from "@Src/types";
import { findByName } from "../utils";

interface TotalXtraTalentArgs {
  char: Character;
  appChar: AppCharacter;
  talentType: Talent;
  partyData?: PartyData;
}
export const getTotalXtraTalentLv = ({ char, appChar, talentType, partyData }: TotalXtraTalentArgs) => {
  let result = 0;

  if (talentType === "NAs") {
    if (char.name === "Tartaglia" || (partyData && findByName(partyData, "Tartaglia"))) {
      result++;
    }
  }
  if (talentType !== "altSprint") {
    const consLv = appChar.talentLvBonus?.[talentType];

    if (consLv && char.cons >= consLv) {
      result += 3;
    }
  }
  return result;
};
