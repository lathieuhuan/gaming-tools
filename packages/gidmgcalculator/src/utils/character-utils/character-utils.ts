import type {
  AppCharacter,
  AttackElement,
  AttackPattern,
  Character,
  ElementType,
  Level,
  TalentAttributeType,
  WeaponType,
} from "@Src/types";
import { $AppSettings } from "@Src/services";
import { getBareLv } from "../utils";
import { BASE_REACTION_DAMAGE, TALENT_LV_MULTIPLIERS } from "./character-stats";

export function createCharacter(name: string, info: Partial<Character>): Character {
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

export function getTalentMult(scale: number, level: number): number {
  return scale ? TALENT_LV_MULTIPLIERS[scale][level] : 1;
}

export function getBaseRxnDmg(level: Level): number {
  return BASE_REACTION_DAMAGE[getBareLv(level)];
}

export function getTalentDefaultInfo(
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