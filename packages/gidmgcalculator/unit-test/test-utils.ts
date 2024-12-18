import { CalculationInfo, Level } from "../src/backend";
import { $AppCharacter, $AppWeapon } from "../src/services";
import { PartyData, Weapon } from "../src/types";
import { __EMockCharacter } from "./mocks/characters.mock";
import { __EMockWeapon } from "./mocks/weapons.mock";
import { ASCENSION_RANKS } from "./test-constants";

export function __genCalculationInfo(
  characterName: __EMockCharacter = __EMockCharacter.BASIC,
  partyData: PartyData = []
): CalculationInfo {
  return {
    char: {
      name: characterName,
      level: "1/20",
      cons: 0,
      NAs: 1,
      ES: 1,
      EB: 1,
    },
    appChar: $AppCharacter.get(characterName),
    partyData,
  };
}

export function __findAscensionByLevel(level: Level) {
  return ASCENSION_RANKS.find((rank) => rank.levels.includes(level))!.value;
}

export function __genWeaponInfo(code: __EMockWeapon = __EMockWeapon.SWORD) {
  const weapon: Weapon = {
    code: code,
    type: "sword",
    ID: 1,
    level: "1/20",
    refi: 1,
  };
  return {
    weapon,
    appWeapon: $AppWeapon.get(code)!,
  };
}
