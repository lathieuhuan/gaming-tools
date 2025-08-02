import { MutableTeamData } from "../src/calculation/utils/CalcTeamData";
import { Level } from "../src/calculation/types";
import { $AppCharacter, $AppWeapon } from "../src/services";
import { Character, Teammate, Weapon } from "../src/types";
import { __EMockCharacter } from "./mocks/characters.mock";
import { __EMockWeapon } from "./mocks/weapons.mock";
import { ASCENSION_RANKS } from "./test-constants";

export class MutableTeamDataTester extends MutableTeamData {
  __changeActiveMember = (name: string) => {
    this.updateActiveMember(name, {
      [name]: $AppCharacter.get(name),
    });
  };

  __updateActiveMember = (info: Partial<Character>) => {
    this._activeMember = {
      ...this._activeMember,
      ...info,
    };
  };

  __changeTeammates = (names: string[]) => {
    const teammates = names.map<Teammate>((name) => ({
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

    for (const name of names) {
      if (!this.data[name]) {
        this.data[name] = $AppCharacter.get(name);
      }
    }

    this.updateTeammates(teammates, {});
  };
}

export function __genMutableTeamDataTester(characterName: __EMockCharacter = __EMockCharacter.BASIC) {
  return new MutableTeamDataTester(
    {
      name: characterName,
      level: "1/20",
      cons: 0,
      NAs: 1,
      ES: 1,
      EB: 1,
    },
    [],
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
