import { CalcTeamData, CharacterCalc } from "@Calculation";
import { ExactOmit, PartiallyRequiredOnly } from "rond";

import {
  CalcSetup,
  CalcTeammate,
  createArtifactBuffCtrls,
  createWeaponBuffCtrls,
} from "@/models/calculator";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@/services";
import {
  BasicSetupType,
  IArtifactBasic,
  IDbComplexSetup,
  IDbSetup,
  IDbTeammate,
  IDbWeapon,
  IModifierCtrlBasic,
  ISetupManager,
  ITeammateArtifact,
  ITeammateWeapon,
  IWeaponBasic,
  Target,
  Teammates,
  UserArtifacts,
  UserSetupCalcInfo,
} from "@/types";
import Array_ from "./Array";
import Entity_, { createArtifact, createTarget, createWeapon } from "./Entity";
import Modifier_ from "./Modifier";
import Object_ from "./Object";
import { ArtifactGear, CalcCharacter, Team } from "@/models/base";
import IdStore from "./IdStore";

type CleanupCalcSetupOptions = {
  weaponID?: number;
  artifactIDs?: (number | null)[];
};

export function isDbSetup(setup: IDbSetup | IDbComplexSetup): setup is IDbSetup {
  return ["original", "combined"].includes(setup.type);
}

function toDbCtrls<TCtrl extends IModifierCtrlBasic, TExtraKeys extends keyof TCtrl>(
  ctrls: TCtrl[],
  extraKeys: TExtraKeys[] = []
) {
  const result: Array<IModifierCtrlBasic & { [K in TExtraKeys]: TCtrl[K] }> = [];

  for (const ctrl of ctrls) {
    if (ctrl.activated) {
      result.push(Object_.pickProps(ctrl, ["id", "activated", "inputs", ...extraKeys]));
    }
  }

  return result;
}

export function toDbSetup(
  setup: CalcSetup,
  manager: Partial<ExactOmit<ISetupManager, "type">> & { type?: BasicSetupType } = {}
): IDbSetup {
  const { ID = setup.ID, type = "original", name = "New setup" } = manager;
  const { main, target } = setup;

  return {
    ID,
    type,
    name,
    main: {
      name: main.name,
      level: main.level,
      NAs: main.NAs,
      ES: main.ES,
      EB: main.EB,
      cons: main.cons,
      enhanced: main.enhanced,
      weaponID: main.weapon.ID,
      artifactIDs: main.atfGear.pieces.map((artifact) => artifact.ID),
    },
    selfBuffCtrls: toDbCtrls(setup.selfBuffCtrls),
    selfDebuffCtrls: toDbCtrls(setup.selfDebuffCtrls),
    wpBuffCtrls: toDbCtrls(setup.wpBuffCtrls),
    artBuffCtrls: toDbCtrls(setup.artBuffCtrls, ["code"]),
    artDebuffCtrls: toDbCtrls(setup.artDebuffCtrls, ["code"]),
    teammates: setup.teammates.map((teammate) => {
      return {
        name: teammate.name,
        enhanced: teammate.enhanced,
        buffCtrls: toDbCtrls(teammate.buffCtrls),
        debuffCtrls: toDbCtrls(teammate.debuffCtrls),
        weapon: {
          code: teammate.weapon.code,
          type: teammate.weapon.type,
          refi: teammate.weapon.refi,
          buffCtrls: toDbCtrls(teammate.weapon.buffCtrls),
        },
        artifact: teammate.artifact && {
          code: teammate.artifact.code,
          buffCtrls: toDbCtrls(teammate.artifact.buffCtrls),
        },
      };
    }),
    teamBuffCtrls: toDbCtrls(setup.teamBuffCtrls),
    rsnBuffCtrls: setup.rsnBuffCtrls,
    rsnDebuffCtrls: setup.rsnDebuffCtrls,
    elmtEvent: setup.elmtEvent,
    customBuffCtrls: setup.customBuffCtrls.filter((ctrl) => ctrl.value),
    customDebuffCtrls: setup.customDebuffCtrls.filter((ctrl) => ctrl.value),
    target: target.serialize(),
  };
}

// ===== RESTORE =====

type Restorable = {
  activated: boolean;
  id?: number;
  inputs?: number[];
  code?: number; // Only on ArtifactBuffCtrl
};

function restoreModCtrls<T extends Restorable, K extends keyof T>(
  newCtrls: T[],
  refCtrls: T[],
  key: K[] = []
): T[] {
  for (const refCtrl of refCtrls) {
    const newCtrl = newCtrls.find((ctrl) => {
      return ctrl.id === refCtrl.id && key.every((k) => ctrl[k] === refCtrl[k]);
    });

    if (newCtrl) {
      newCtrl.activated = true;

      if (refCtrl.inputs && newCtrl.inputs) {
        newCtrl.inputs = refCtrl.inputs;
      }
    }
  }

  return newCtrls;
}

function restoreTeammate(teammate: IDbTeammate, team: Team) {
  const weaponData = $AppWeapon.get(teammate.weapon.code)!;
  const weapon: ITeammateWeapon = {
    code: teammate.weapon.code,
    type: weaponData.type,
    refi: teammate.weapon.refi,
    buffCtrls: createWeaponBuffCtrls(weaponData, false),
    data: weaponData,
  };

  let artifact: ITeammateArtifact | undefined;

  if (teammate.artifact) {
    const artifactData = $AppArtifact.getSet(teammate.artifact.code)!;

    artifact = {
      code: teammate.artifact.code,
      buffCtrls: createArtifactBuffCtrls(artifactData, false),
      data: artifactData,
    };
  }

  const data = $AppCharacter.get(teammate.name)!;
  const standard = new CalcTeammate(
    {
      name: teammate.name,
      enhanced: teammate.enhanced,
      weapon,
      artifact,
    },
    data,
    team
  );

  restoreModCtrls(standard.buffCtrls, teammate.buffCtrls);
  restoreModCtrls(standard.debuffCtrls, teammate.debuffCtrls);

  return standard;
}

export function restoreCalcSetup(
  data: IDbSetup,
  weaponBasic: IWeaponBasic,
  artifactBasics: IArtifactBasic[] = [],
  idStore = new IdStore()
) {
  const weapon = createWeapon(weaponBasic, undefined, idStore);
  const artifacts = artifactBasics.map((artifactBasic) => {
    return createArtifact(artifactBasic, undefined, idStore);
  });
  const atfGear = new ArtifactGear(artifacts);

  const main = new CalcCharacter(
    {
      ...data.main,
      weapon,
      atfGear,
    },
    $AppCharacter.get(data.main.name)!
  );
  const team = new Team();
  const teammates = data.teammates.map((teammate) => restoreTeammate(teammate, team));

  team.updateMembers([main, ...teammates]);

  const setup = new CalcSetup({
    main,
    teammates,
    team,
    elmtEvent: data.elmtEvent,
    target: createTarget(data.target),
  });

  restoreModCtrls(setup.selfBuffCtrls, data.selfBuffCtrls);
  restoreModCtrls(setup.selfDebuffCtrls, data.selfDebuffCtrls);
  restoreModCtrls(setup.wpBuffCtrls, data.wpBuffCtrls);
  restoreModCtrls(setup.artBuffCtrls, data.artBuffCtrls, ["code"]);
  restoreModCtrls(setup.artDebuffCtrls, data.artDebuffCtrls, ["code"]);
  restoreModCtrls(setup.teamBuffCtrls, data.teamBuffCtrls);
  restoreModCtrls(setup.rsnBuffCtrls, data.rsnBuffCtrls, ["element"]);
  restoreModCtrls(setup.rsnDebuffCtrls, data.rsnDebuffCtrls, ["element"]);

  return setup;
}

export default class Setup_ {
  static userSetupToCalcSetup(
    setup: UserSetup,
    weapon: IDbWeapon,
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

    const teamData = new CalcTeamData(char, party, Entity_.getAppCharacters(char.name, party));

    return {
      char,
      ...data,
      teamBuffCtrls: data.teamBuffCtrls.filter((ctrl) => ctrl.activated),
      weaponID: options?.weaponID || weapon.ID,
      artifactIDs: options?.artifactIDs || artifacts.map((artifact) => artifact?.ID ?? null),
      selfBuffCtrls: data.selfBuffCtrls.filter((ctrl) => {
        const buff = Array_.findByIndex(buffs, ctrl.index);
        return buff ? ctrl.activated && CharacterCalc.isGrantedMod(buff, teamData) : false;
      }),
      selfDebuffCtrls: data.selfDebuffCtrls.filter((ctrl) => {
        const debuff = Array_.findByIndex(debuffs, ctrl.index);
        return debuff ? ctrl.activated && CharacterCalc.isGrantedMod(debuff, teamData) : false;
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

    const teamBuffCtrls = Modifier_.createTeamBuffCtrls(output);

    return Object_.assign(output, {
      teamBuffCtrls: restoreModCtrls(teamBuffCtrls, data.teamBuffCtrls),
    });
  }

  static createCalcSetup({
    char,
    artifacts = [null, null, null, null, null],
    artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(artifacts),
    artDebuffCtrls = Modifier_.createArtifactDebuffCtrls(),
    party = [null, null, null],
    teamBuffCtrls = [],
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
      teamBuffCtrls,
      elmtModCtrls,
      customBuffCtrls,
      customDebuffCtrls,
      customInfusion,
    };
  }
}
