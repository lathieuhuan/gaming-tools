import { ExactOmit } from "rond";

import type {
  BasicSetupType,
  IArtifactBasic,
  IArtifactBuffCtrl,
  IDbComplexSetup,
  IDbSetup,
  IModifierCtrlBasic,
  ISetupManager,
  ITeammateArtifact,
  ITeammateBasic,
  ITeammateWeapon,
  IWeaponBasic,
  IWeaponBuffCtrl,
} from "@/types";

import { ArtifactGear, CalcCharacter, Team } from "@/models/base";
import {
  CalcSetup,
  CalcTeammate,
  createArtifactBuffCtrls,
  createWeaponBuffCtrls,
} from "@/models/calculator";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import { createArtifact, createTarget, createWeapon } from "./entity-utils";
import IdStore from "./IdStore";
import { enhanceCtrls } from "./modifier-utils";
import Object_ from "./Object";

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

function restoreTeammate(teammate: ITeammateBasic, team: Team) {
  const weaponData = $AppWeapon.get(teammate.weapon.code)!;
  const weaponBuffs = weaponData.buffs || [];
  const weaponBuffCtrls: IWeaponBuffCtrl[] = enhanceCtrls(teammate.weapon.buffCtrls, weaponBuffs);

  const weapon: ITeammateWeapon = {
    code: teammate.weapon.code,
    type: weaponData.type,
    refi: teammate.weapon.refi,
    buffCtrls: restoreModCtrls(createWeaponBuffCtrls(weaponData, false), weaponBuffCtrls),
    data: weaponData,
  };

  let artifact: ITeammateArtifact | undefined;

  if (teammate.artifact) {
    const artifactData = $AppArtifact.getSet(teammate.artifact.code)!;
    const artifactBuffs = artifactData.buffs || [];
    const artifactBuffCtrls: IArtifactBuffCtrl[] = enhanceCtrls(
      teammate.artifact.buffCtrls,
      artifactBuffs
    );

    artifact = {
      code: teammate.artifact.code,
      buffCtrls: restoreModCtrls(createArtifactBuffCtrls(artifactData, false), artifactBuffCtrls),
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
