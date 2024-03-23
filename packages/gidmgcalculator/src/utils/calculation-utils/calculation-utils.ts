import type {
  AppCharacter,
  ArtifactSetBonus,
  AttackElement,
  CalcArtifacts,
  Character,
  ElementType,
  Level,
  PartyData,
  ReactionBonus,
  Talent,
} from "@Src/types";
import { findByName } from "../utils";
import { BASE_REACTION_DAMAGE } from "./calculation-utils.constants";

interface TotalXtraTalentArgs {
  char: Character;
  appChar: AppCharacter;
  talentType: Talent;
  partyData?: PartyData;
}

export class Calculation_ {
  static getBareLv = (level: Level): number => +level.split("/")[0];

  static getAscension = (level: Level) => {
    const maxLv = +level.slice(-2);
    return maxLv === 20 ? 0 : maxLv / 10 - 3;
  };

  static splitLv = (subject: { level: Level }) => {
    return subject.level.split("/").map((lv) => +lv);
  };

  static getTotalXtraTalentLv({ char, appChar, talentType, partyData }: TotalXtraTalentArgs) {
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

  static countElements(partyData: PartyData, appChar?: AppCharacter) {
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

  static getArtifactSetBonuses(artifacts: CalcArtifacts = []): ArtifactSetBonus[] {
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

  static getRxnBonusesFromEM(EM = 0) {
    return {
      transformative: Math.round((16000 * EM) / (EM + 2000)) / 10,
      amplifying: Math.round((2780 * EM) / (EM + 1400)) / 10,
      quicken: Math.round((5000 * EM) / (EM + 1200)) / 10,
      shield: Math.round((4440 * EM) / (EM + 1400)) / 10,
    };
  }

  static getAmplifyingMultiplier(elmt: AttackElement, rxnBonus: ReactionBonus) {
    return {
      melt: (1 + rxnBonus.melt.pct_ / 100) * (elmt === "pyro" ? 2 : elmt === "cryo" ? 1.5 : 1),
      vaporize: (1 + rxnBonus.vaporize.pct_ / 100) * (elmt === "pyro" ? 1.5 : elmt === "hydro" ? 2 : 1),
    };
  }

  static getBaseRxnDmg(level: Level): number {
    return BASE_REACTION_DAMAGE[this.getBareLv(level)];
  }

  static getQuickenBuffDamage(charLv: Level, rxnBonus: ReactionBonus) {
    const base = this.getBaseRxnDmg(charLv);

    return {
      aggravate: Math.round(base * 1.15 * (1 + rxnBonus.aggravate.pct_ / 100)),
      spread: Math.round(base * 1.25 * (1 + rxnBonus.spread.pct_ / 100)),
    };
  }
}
