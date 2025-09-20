import { ATTACK_ELEMENTS, CharacterCalc, WeaponType } from "@Calculation";
import { PartiallyRequiredOnly } from "rond";

import { $AppCharacter } from "@/services";
import type {
  CalcSetup,
  CalcSetupManageInfo,
  Teammates,
  Target,
  Teammate,
  UserArtifacts,
  UserComplexSetup,
  UserSetup,
  UserSetupCalcInfo,
  UserWeapon,
} from "@/types";
import Modifier_ from "./Modifier";
import Array_ from "./Array";
import Entity_ from "./Entity";
import Object_ from "./Object";

type CleanupCalcSetupOptions = {
  weaponID?: number;
  artifactIDs?: (number | null)[];
};

export default class Setup_ {
  static isUserSetup(setup: UserSetup | UserComplexSetup): setup is UserSetup {
    return ["original", "combined"].includes(setup.type);
  }

  static userSetupToCalcSetup(
    setup: UserSetup,
    weapon: UserWeapon,
    artifacts: UserArtifacts,
    shouldRestore?: boolean
  ): CalcSetup {
    const { weaponID, artifactIDs, ID, name, type, target, ...rest } = setup;
    const calcSetup = {
      ...rest,
      weapon: Entity_.userItemToCalcItem(weapon),
      artifacts: artifacts.map((artifact) =>
        artifact ? Entity_.userItemToCalcItem(artifact) : null
      ),
    };

    return shouldRestore ? this.restoreCalcSetup(calcSetup) : calcSetup;
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

  static cleanupCalcSetup(
    setup: CalcSetup,
    target: Target,
    options?: CleanupCalcSetupOptions
  ): UserSetupCalcInfo {
    const { char, weapon, artifacts, ...data } = setup;
    const { buffs = [], debuffs = [] } = $AppCharacter.get(char.name) || {};
    const party: Teammates = [];

    for (const teammate of data.party) {
      if (teammate) {
        party.push({
          name: teammate.name,
          buffCtrls: teammate.buffCtrls.filter((ctrl) => ctrl.activated),
          debuffCtrls: teammate.debuffCtrls.filter((ctrl) => ctrl.activated),
          weapon: {
            ...teammate.weapon,
            buffCtrls: teammate.weapon.buffCtrls.filter((ctrl) => ctrl.activated),
          },
          artifact: {
            ...teammate.artifact,
            buffCtrls: teammate.artifact.buffCtrls.filter((ctrl) => ctrl.activated),
          },
        });
      }
    }
    if (party.length < 3) {
      party.push(...Array(3 - party.length).fill(null));
    }

    return {
      char,
      ...data,
      weaponID: options?.weaponID || weapon.ID,
      artifactIDs: options?.artifactIDs || artifacts.map((artifact) => artifact?.ID ?? null),
      selfBuffCtrls: data.selfBuffCtrls.filter((ctrl) => {
        const buff = Array_.findByIndex(buffs, ctrl.index);
        return buff ? ctrl.activated && CharacterCalc.isGrantedEffect(buff.grantedAt, char) : false;
      }),
      selfDebuffCtrls: data.selfDebuffCtrls.filter((ctrl) => {
        const debuff = Array_.findByIndex(debuffs, ctrl.index);
        return debuff
          ? ctrl.activated && CharacterCalc.isGrantedEffect(debuff.grantedAt, char)
          : false;
      }),
      wpBuffCtrls: data.wpBuffCtrls.filter((ctrl) => ctrl.activated),
      party,
      artBuffCtrls: data.artBuffCtrls.filter((ctrl) => ctrl.activated),
      artDebuffCtrls: data.artDebuffCtrls.filter((ctrl) => ctrl.activated),
      customBuffCtrls: data.customBuffCtrls.filter((ctrl) => ctrl.value),
      customDebuffCtrls: data.customDebuffCtrls.filter((ctrl) => ctrl.value),
      target,
    };
  }

  static restoreCalcSetup(data: CalcSetup) {
    const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(
      data.char.name,
      true
    );
    const wpBuffCtrls = Modifier_.createWeaponBuffCtrls(data.weapon, true);
    const party: Teammates = [];

    for (const index of [0, 1, 2]) {
      const teammate = data.party[index];

      if (teammate) {
        const [buffCtrls, debuffCtrls] = Modifier_.createCharacterModCtrls(teammate.name, false);
        const weapon = Object_.clone(teammate.weapon);
        const artifact = Object_.clone(teammate.artifact);

        party.push({
          name: teammate.name,
          buffCtrls: restoreModCtrls(buffCtrls, teammate.buffCtrls),
          debuffCtrls: restoreModCtrls(debuffCtrls, teammate.debuffCtrls),
          weapon: {
            ...weapon,
            buffCtrls: restoreModCtrls(
              Modifier_.createWeaponBuffCtrls(weapon, false),
              weapon.buffCtrls
            ),
          },
          artifact: {
            ...artifact,
            buffCtrls: restoreModCtrls(
              Modifier_.createArtifactBuffCtrls(artifact, false),
              artifact.buffCtrls
            ),
          },
        });
      } else {
        party.push(null);
      }
    }

    const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(data.artifacts);

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
    const [buffCtrls, debuffCtrls] = Modifier_.createCharacterModCtrls(name, false);

    return {
      name,
      buffCtrls,
      debuffCtrls,
      weapon: {
        code: Entity_.getDefaultWeaponCode(weaponType),
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

  static createTarget(defaultValues?: Partial<Target>) {
    const result = { code: 0, level: 1, resistances: {} } as Target;
    for (const elmt of ATTACK_ELEMENTS) {
      result.resistances[elmt] = 10;
    }
    return Object.assign(result, defaultValues);
  }

  static createCalcSetup({
    char,
    artifacts = [null, null, null, null, null],
    artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(artifacts),
    artDebuffCtrls = Modifier_.createArtifactDebuffCtrls(),
    party = [null, null, null],
    elmtModCtrls = Modifier_.createElmtModCtrls(),
    customBuffCtrls = [],
    customDebuffCtrls = [],
    customInfusion = { element: "phys" },
    ...rest
  }: PartiallyRequiredOnly<CalcSetup, "char">): CalcSetup {
    const appCharacter = $AppCharacter.get(char.name);
    const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(appCharacter, true);
    const weapon = rest.weapon || Entity_.createWeapon({ type: appCharacter.weaponType });

    return {
      char,
      weapon,
      artifacts,
      selfBuffCtrls: rest.selfBuffCtrls || selfBuffCtrls,
      selfDebuffCtrls: rest.selfDebuffCtrls || selfDebuffCtrls,
      wpBuffCtrls: rest.wpBuffCtrls || Modifier_.createWeaponBuffCtrls(weapon, true),
      artBuffCtrls,
      artDebuffCtrls,
      party,
      // moonsignCtrl: {
      //   active: false,
      //   type: "hp",
      //   value: 0,
      // },
      elmtModCtrls,
      customBuffCtrls,
      customDebuffCtrls,
      customInfusion,
    };
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
