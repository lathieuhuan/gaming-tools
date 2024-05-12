import type { CalcArtifacts, PartyData } from "@Src/types";
import type {
  AmplifyingReaction,
  AppCharacter,
  AttackElement,
  ElementType,
  Level,
  QuickenReaction,
} from "@Src/backend/types";

export type ArtifactSetBonus = {
  code: number;
  bonusLv: number;
};

const BASE_REACTION_DAMAGE: Record<number, number> = {
  1: 17.17,
  20: 80.58,
  40: 207.38,
  50: 323.6,
  60: 492.88,
  70: 765.64,
  80: 1077.44,
  90: 1446.85,
};

export class GeneralCalc {
  static getBareLv = (level: Level): number => +level.split("/")[0];

  static getAscension = (level: Level) => {
    const maxLv = +level.slice(-2);
    return maxLv === 20 ? 0 : maxLv / 10 - 3;
  };

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

  static getBaseRxnDmg(level: Level): number {
    return BASE_REACTION_DAMAGE[this.getBareLv(level)];
  }

  static getQuickenBuffDamage(reaction: QuickenReaction, charLv: Level, pctBonus: number) {
    const base = this.getBaseRxnDmg(charLv);

    switch (reaction) {
      case "aggravate":
        return Math.round(base * 1.15 * (1 + pctBonus / 100));
      case "spread":
        return Math.round(base * 1.25 * (1 + pctBonus / 100));
      default:
        return 1;
    }
  }

  static getAmplifyingMultiplier(reaction: AmplifyingReaction, elmt: AttackElement, pctBonus: number) {
    switch (reaction) {
      case "melt":
        return (1 + pctBonus / 100) * (elmt === "pyro" ? 2 : elmt === "cryo" ? 1.5 : 1);
      case "vaporize":
        return (1 + pctBonus / 100) * (elmt === "pyro" ? 1.5 : elmt === "hydro" ? 2 : 1);
      default:
        return 1;
    }
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
}
