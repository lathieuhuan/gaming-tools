import type {
  AppCharacter,
  AttackElement,
  AttackPattern,
  Character,
  ElementType,
  PartyData,
  Talent,
  TalentAttributeType,
  WeaponType,
} from "@Src/types";
import { $AppSettings } from "@Src/services";
import { findByName } from "../utils";
import { TALENT_LV_MULTIPLIERS } from "./character-stats";

interface GetTotalXtraTalentArgs {
  char: Character;
  appChar: AppCharacter;
  talentType: Talent;
  partyData?: PartyData;
}

export class Character_ {
  static create(name: string, info?: Partial<Character>): Character {
    const { charLevel, charCons, charNAs, charES, charEB } = $AppSettings.get();

    return {
      name: name,
      level: info?.level || charLevel,
      NAs: info?.NAs || charNAs,
      ES: info?.ES || charES,
      EB: info?.EB || charEB,
      cons: info?.cons || charCons,
    };
  }

  static getTotalXtraTalentLv({ char, appChar, talentType, partyData }: GetTotalXtraTalentArgs): number {
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

  static getFinalTalentLv(args: GetTotalXtraTalentArgs): number {
    const talentLv = args.talentType === "altSprint" ? 0 : args.char[args.talentType];
    return talentLv + this.getTotalXtraTalentLv(args);
  }

  static getTalentMult(scale: number, level: number): number {
    return scale ? TALENT_LV_MULTIPLIERS[scale][level] : 1;
  }

  static getTalentDefaultInfo(
    key: "NAs" | "ES" | "EB",
    weaponType: WeaponType,
    elementType: ElementType,
    attPatt: AttackPattern,
    config?: AppCharacter["multFactorConf"]
  ): {
    attElmt: AttackElement;
    scale: number;
    basedOn: TalentAttributeType;
    flatFactorScale: number;
  } {
    const attElmt = key === "NAs" && weaponType !== "catalyst" ? "phys" : elementType;
    const defaultScale = attPatt === "PA" ? 7 : attElmt === "phys" ? 1 : 2;
    const defaultBasedOn: TalentAttributeType = "atk";
    const { scale = defaultScale, basedOn = defaultBasedOn } = config?.[attPatt] || {};

    return {
      attElmt,
      scale,
      basedOn,
      flatFactorScale: 3,
    };
  }
}
