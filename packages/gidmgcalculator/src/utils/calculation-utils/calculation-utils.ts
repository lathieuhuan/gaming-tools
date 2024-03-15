import type {
  AppCharacter,
  ArtifactSetBonus,
  CalcArtifacts,
  Character,
  ElementType,
  PartyData,
  Talent,
  Target,
} from "@Src/types";
import { findByName } from "../utils";
import { ATTACK_ELEMENTS } from "@Src/constants";

interface TotalXtraTalentArgs {
  char: Character;
  appChar: AppCharacter;
  talentType: Talent;
  partyData?: PartyData;
}
export function getTotalXtraTalentLv({ char, appChar, talentType, partyData }: TotalXtraTalentArgs) {
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
}

export function countElements(partyData: PartyData, appChar?: AppCharacter) {
  const result: Partial<Record<ElementType, number>> = {};
  if (appChar) {
    result[appChar.vision] = 1;
  }
  return partyData.reduce((count, teammateData) => {
    if (teammateData) {
      count[teammateData.vision] = (count[teammateData.vision] || 0) + 1;
    }

    return count;
  }, result);
}

export function getArtifactSetBonuses(artifacts: CalcArtifacts = []): ArtifactSetBonus[] {
  const sets = [];
  const count: Record<number, number> = {};

  for (const artifact of artifacts) {
    if (artifact) {
      const { code } = artifact;
      count[code] = (count[code] || 0) + 1;

      if (count[code] === 2) {
        sets.push({ code, bonusLv: 0 });
      } else if (count[code] === 4) {
        sets[0].bonusLv = 1;
      }
    }
  }
  return sets;
}

export function createTarget() {
  const result = { code: 0, level: 1, resistances: {} } as Target;
  for (const elmt of ATTACK_ELEMENTS) {
    result.resistances[elmt] = 10;
  }
  return result;
}
