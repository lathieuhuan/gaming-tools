import type {
  CalcSetup,
  CalcSetupManageInfo,
  Party,
  Target,
  Teammate,
  UserComplexSetup,
  UserSetup,
  WeaponType,
} from "@Src/types";
import { ATTACK_ELEMENTS } from "@Src/constants";
import { Modifier_ } from "../modifier-utils";
import { Weapon_ } from "../weapon-utils";
import { Calculation_ } from "../calculation-utils";
import { deepCopy } from "../utils";

export class Setup_ {
  static isUserSetup(setup: UserSetup | UserComplexSetup): setup is UserSetup {
    return ["original", "combined"].includes(setup.type);
  }

  static getCopyName(originalName: string, existedNames: string[]) {
    const { nameRoot } = destructName(originalName);
    const versions = [];

    for (const existedName of existedNames) {
      const destructed = destructName(existedName);

      if (destructed.nameRoot === nameRoot && destructed.copyNo) {
        versions[+destructed.copyNo] = true;
      }
    }
    for (let i = 1; i <= 100; i++) {
      if (!versions[i]) {
        return nameRoot + ` (${i})`;
      }
    }

    return undefined;
  }

  static getManageInfo(defaultInfo: Partial<CalcSetupManageInfo>): CalcSetupManageInfo {
    const { name = "Setup 1", ID = Date.now(), type = "original" } = defaultInfo;
    return { name: name.trim(), ID, type };
  }

  static restoreCalcSetup(data: CalcSetup) {
    const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(true, data.char.name);
    const wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, data.weapon);
    const party: Party = [];

    for (const index of [0, 1, 2]) {
      const teammate = data.party[index];

      if (teammate) {
        const [buffCtrls, debuffCtrls] = Modifier_.createCharacterModCtrls(false, teammate.name);
        const weapon = deepCopy(teammate.weapon);
        const artifact = deepCopy(teammate.artifact);

        party.push({
          name: teammate.name,
          buffCtrls: restoreModCtrls(buffCtrls, teammate.buffCtrls),
          debuffCtrls: restoreModCtrls(debuffCtrls, teammate.debuffCtrls),
          weapon: {
            ...weapon,
            buffCtrls: restoreModCtrls(Modifier_.createWeaponBuffCtrls(false, weapon), weapon.buffCtrls),
          },
          artifact: {
            ...artifact,
            buffCtrls: restoreModCtrls(Modifier_.createArtifactBuffCtrls(false, artifact), artifact.buffCtrls),
          },
        });
      } else {
        party.push(null);
      }
    }

    const setBonuses = Calculation_.getArtifactSetBonuses(data.artifacts);
    const artBuffCtrls = setBonuses[0]?.bonusLv ? Modifier_.createArtifactBuffCtrls(true, setBonuses[0]) : [];

    const output: CalcSetup = {
      ...data,
      selfBuffCtrls: restoreModCtrls(selfBuffCtrls, data.selfBuffCtrls),
      selfDebuffCtrls: restoreModCtrls(selfDebuffCtrls, data.selfDebuffCtrls),
      wpBuffCtrls: restoreModCtrls(wpBuffCtrls, data.wpBuffCtrls),
      party,
      artBuffCtrls: restoreModCtrls(artBuffCtrls, data.artBuffCtrls),
      artDebuffCtrls: restoreModCtrls(Modifier_.createArtifactDebuffCtrls(), data.artDebuffCtrls),
    };

    return output;
  }

  static createTeammate({ name, weaponType }: CreateTeammateArgs): Teammate {
    const [buffCtrls, debuffCtrls] = Modifier_.createCharacterModCtrls(false, name);

    return {
      name,
      buffCtrls,
      debuffCtrls,
      weapon: {
        code: Weapon_.create({ type: weaponType }).code,
        type: weaponType,
        refi: 1,
        buffCtrls: [],
      },
      artifact: {
        code: 0,
        buffCtrls: [],
      },
    };
  }

  static createTarget() {
    const result = { code: 0, level: 1, resistances: {} } as Target;
    for (const elmt of ATTACK_ELEMENTS) {
      result.resistances[elmt] = 10;
    }
    return result;
  }
}

interface CreateTeammateArgs {
  name: string;
  weaponType: WeaponType;
}

function destructName(name: string) {
  const lastWord = name.match(/\s+\(([1-9]+)\)$/);

  if (lastWord?.index && lastWord[1]) {
    return {
      nameRoot: name.slice(0, lastWord.index),
      copyNo: lastWord[1],
    };
  }
  return {
    nameRoot: name,
    copyNo: null,
  };
}

type Restorable = {
  activated: boolean;
  index: number;
  inputs?: number[];
  code?: number;
};
function restoreModCtrls<T extends Restorable>(newCtrls: T[], refCtrls: T[]): T[] {
  for (const refCtrl of refCtrls) {
    const i = newCtrls.findIndex(({ code, index }) => {
      return index === refCtrl.index && code === refCtrl.code;
    });

    if (i !== -1) {
      newCtrls[i].activated = true;
      if (refCtrl.inputs && newCtrls[i].inputs) {
        newCtrls[i].inputs = refCtrl.inputs;
      }
    }
  }
  return newCtrls;
}
