import { MutableTeamData } from "../src/calculation/CalcTeamData";
import { IWeaponBasic, Level } from "../src/types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "../src/services";
import { ICharacter, ITeammate, IWeapon } from "../src/types";
import { __EMockCharacter } from "./mocks/characters.mock";
import { __EMockWeapon } from "./mocks/weapons.mock";
import { ASCENSION_RANKS } from "./test-constants";

export class MutableTeamDataTester extends MutableTeamData {
  __changeActiveMember = (name: string) => {
    this.updateActiveMember(name, {
      [name]: $AppCharacter.get(name),
    });
  };

  __updateActiveMember = (info: Partial<ICharacter>) => {
    this._activeMember = {
      ...this._activeMember,
      ...info,
    };
  };

  __changeTeammates = (names: string[]) => {
    const teammates = names.map<ITeammate>((name) => ({
      name: name,
      weapon: {
        buffCtrls: [],
        code: 0,
        refi: 1,
        type: "sword",
        data: $AppWeapon.get(0)!,
      },
      artifact: {
        code: 0,
        buffCtrls: [],
        data: $AppArtifact.getSet(0)!,
      },
      buffCtrls: [],
      debuffCtrls: [],
      enhanced: false,
      data: $AppCharacter.get(name)!,
      join: () => {},
      isPerformableEffect: () => false,
    }));

    for (const name of names) {
      if (!this.data[name]) {
        this.data[name] = $AppCharacter.get(name);
      }
    }

    this.updateTeammates(teammates, {});
  };
}

export function __genMutableTeamDataTester(
  characterName: __EMockCharacter = __EMockCharacter.BASIC
) {
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
  const weapon: IWeaponBasic = {
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
