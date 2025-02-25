import { CharacterData, Level } from "../src/backend";
import { $AppCharacter, $AppWeapon } from "../src/services";
import { Teammate, Weapon } from "../src/types";
import { __EMockCharacter } from "./mocks/characters.mock";
import { __EMockWeapon } from "./mocks/weapons.mock";
import { ASCENSION_RANKS } from "./test-constants";

export class CharacterDataTester extends CharacterData {
  __updateCharacter = (name: string) => {
    this.character.name = name;
    this["_appCharacter"] = $AppCharacter.get(name);
    this.data[name] = this["_appCharacter"];
  };

  __updateParty = (names: string[]) => {
    const party = names.map<Teammate>((name) => ({
      name: name,
      weapon: {
        buffCtrls: [],
        code: 0,
        refi: 1,
        type: "sword",
      },
      artifact: {
        code: 0,
        buffCtrls: [],
      },
      buffCtrls: [],
      debuffCtrls: [],
    }));
    const extraData: typeof this.data = {};

    for (const name of names) {
      if (!this.data[name]) {
        this.data[name] = $AppCharacter.get(name);
      }
    }

    this.updateParty(party, extraData);
  };
}

export function __genCharacterDataTester(
  characterName: __EMockCharacter = __EMockCharacter.BASIC
): CharacterDataTester {
  return new CharacterDataTester(
    {
      name: characterName,
      level: "1/20",
      cons: 0,
      NAs: 1,
      ES: 1,
      EB: 1,
    },
    {
      [characterName]: $AppCharacter.get(characterName),
    }
  );
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
