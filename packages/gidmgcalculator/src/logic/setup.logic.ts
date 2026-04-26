import { Object_ } from "ron-utils";
import { ExactOmit } from "rond";

import type {
  BasicSetupType,
  ArtifactBuffCtrl,
  DbComplexSetup,
  DbSetup,
  ModifierCtrlState,
  SetupManager,
  WeaponBuffCtrl,
  RawTeammate,
  TeammateArtifact,
} from "@/types";

import { ArtifactGear, CalcSetup, Team, Weapon } from "@/models";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import { enhanceCtrls } from "../logic/modifier.logic";
import { createCharacter, createTarget, createTeammate } from "./entity.logic";
import { createArtifactBuffCtrls } from "./modifier.logic";

export function isDbSetup(setup: DbSetup | DbComplexSetup): setup is DbSetup {
  return ["original", "combined"].includes(setup.type);
}

function toDbCtrls<TCtrl extends ModifierCtrlState, TExtraKeys extends keyof TCtrl>(
  ctrls: TCtrl[],
  extraKeys: TExtraKeys[] = []
) {
  const result: Array<ModifierCtrlState & { [K in TExtraKeys]: TCtrl[K] }> = [];

  for (const ctrl of ctrls) {
    if (ctrl.activated) {
      result.push(Object_.extract(ctrl, ["id", "activated", "inputs", ...extraKeys]));
    }
  }

  return result;
}

export function toDbSetup(
  setup: CalcSetup,
  manager: Partial<ExactOmit<SetupManager, "type">> & { type?: BasicSetupType } = {}
): DbSetup {
  const { ID = setup.ID, type = "original", name = "New setup" } = manager;
  const { main, target } = setup;

  return {
    ID,
    type,
    name,
    main: {
      code: main.code,
      level: main.level,
      NAs: main.NAs,
      ES: main.ES,
      EB: main.EB,
      cons: main.cons,
      enhanced: main.enhanced,
      weaponID: main.weapon.ID,
      artifactIDs: main.atfGear.pieces.list().map((piece) => piece.ID),
    },
    selfBuffCtrls: toDbCtrls(setup.selfBuffCtrls),
    selfDebuffCtrls: toDbCtrls(setup.selfDebuffCtrls),
    wpBuffCtrls: toDbCtrls(setup.wpBuffCtrls),
    artBuffCtrls: toDbCtrls(setup.artBuffCtrls, ["code"]),
    artDebuffCtrls: toDbCtrls(setup.artDebuffCtrls, ["code"]),
    teammates: setup.teammates.map((teammate) => {
      return {
        code: teammate.code,
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
        newCtrl.inputs = [...refCtrl.inputs];
      }
    }
  }

  return newCtrls;
}

function restoreTeammate(teammate: RawTeammate, team: Team) {
  const standard = createTeammate(
    {
      code: teammate.code,
      enhanced: teammate.enhanced,
      weapon: teammate.weapon,
      artifact: teammate.artifact,
    },
    null,
    { team }
  );

  restoreModCtrls(standard.buffCtrls, teammate.buffCtrls);
  restoreModCtrls(standard.debuffCtrls, teammate.debuffCtrls);
  restoreModCtrls(standard.weapon.buffCtrls, teammate.weapon.buffCtrls);

  if (standard.artifact && teammate.artifact) {
    restoreModCtrls(standard.artifact.buffCtrls, teammate.artifact.buffCtrls);
  }

  return standard;
}

export function restoreCalcSetup(data: DbSetup, weapon: Weapon, atfGear: ArtifactGear) {
  const team = new Team();
  const main = createCharacter(data.main, null, {
    state: data.main,
    weapon,
    atfGear,
    team,
  });
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
