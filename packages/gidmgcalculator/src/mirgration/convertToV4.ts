import type {
  ElementalEvent,
  IArtifactModCtrlBasic,
  IDbComplexSetup,
  IDbSetup,
  IModifierCtrlBasic,
  ITeammateBasic,
  ResonanceModCtrl,
} from "@/types";
import type { DatabaseDataV3_1 } from "./types/v3_1";
import type { DatabaseDataV4 } from "./types/v4";

import Array_ from "@/utils/Array";

type V3_1Setup = Exclude<DatabaseDataV3_1["setups"][number], IDbComplexSetup>;
type V3_1ModifierCtrl = V3_1Setup["selfBuffCtrls"][number];
type V3_1ArtifactModifierCtrl = V3_1Setup["artBuffCtrls"][number];
type V3_1Teammate = NonNullable<V3_1Setup["party"][number]>;

function convertModifierCtrl(ctrl: V3_1ModifierCtrl): IModifierCtrlBasic {
  return {
    id: ctrl.index,
    activated: ctrl.activated,
    inputs: ctrl.inputs,
  };
}

function convertArtifactModifierCtrl(ctrl: V3_1ArtifactModifierCtrl): IArtifactModCtrlBasic {
  return {
    id: ctrl.index,
    activated: ctrl.activated,
    inputs: ctrl.inputs,
    code: ctrl.code,
  };
}

function convertTeammate(teammate: V3_1Teammate): ITeammateBasic {
  const atfCode = teammate.artifact.code;

  return {
    name: teammate.name,
    enhanced: teammate.enhanced ?? false,
    buffCtrls: teammate.buffCtrls.map(convertModifierCtrl),
    debuffCtrls: teammate.debuffCtrls.map(convertModifierCtrl),
    weapon: {
      code: teammate.weapon.code,
      type: teammate.weapon.type,
      refi: teammate.weapon.refi,
      buffCtrls: teammate.weapon.buffCtrls.map(convertModifierCtrl),
    },
    artifact:
      atfCode > 0
        ? {
            code: atfCode,
            buffCtrls: teammate.artifact.buffCtrls.map(convertModifierCtrl),
          }
        : undefined,
  };
}

function convertSetup(setup: V3_1Setup): IDbSetup {
  const infusion = setup.customInfusion.element;

  const elmtEvent: ElementalEvent = {
    reaction: setup.elmtModCtrls.reaction,
    absorption: setup.elmtModCtrls.absorption,
    absorbReaction: setup.elmtModCtrls.absorb_reaction,
    infusion: infusion === "phys" ? null : infusion,
    infuseReaction: setup.elmtModCtrls.infuse_reaction,
    superconduct: setup.elmtModCtrls.superconduct,
  };

  const rsnBuffCtrls: ResonanceModCtrl[] = setup.elmtModCtrls.resonances.map((resonance) => ({
    element: resonance.vision,
    activated: resonance.activated,
    inputs: resonance.inputs,
  }));

  return {
    ID: setup.ID,
    type: setup.type,
    name: setup.name,

    main: {
      name: setup.char.name,
      level: setup.char.level,
      NAs: setup.char.NAs,
      ES: setup.char.ES,
      EB: setup.char.EB,
      cons: setup.char.cons,
      enhanced: false,
      weaponID: setup.weaponID,
      artifactIDs: Array_.truthify(setup.artifactIDs),
    },

    selfBuffCtrls: setup.selfBuffCtrls.map(convertModifierCtrl),
    selfDebuffCtrls: setup.selfDebuffCtrls.map(convertModifierCtrl),

    wpBuffCtrls: setup.wpBuffCtrls.map(convertModifierCtrl),
    artBuffCtrls: setup.artBuffCtrls.map(convertArtifactModifierCtrl),
    artDebuffCtrls: setup.artDebuffCtrls.map(convertArtifactModifierCtrl),

    teammates: Array_.truthify(setup.party).map(convertTeammate),
    teamBuffCtrls: setup.teamBuffCtrls || [],
    rsnBuffCtrls,
    rsnDebuffCtrls: [],

    elmtEvent,
    customBuffCtrls: setup.customBuffCtrls,
    customDebuffCtrls: setup.customDebuffCtrls,
    target: setup.target,
  };
}

function isComplexSetup(setup: DatabaseDataV3_1["setups"][number]): setup is IDbComplexSetup {
  return setup.type === "complex";
}

const parseArray = <T>(array: T[]): T[] => {
  return array && Array.isArray(array) ? array : [];
};

export function convertToV4(data: DatabaseDataV3_1): DatabaseDataV4 {
  return {
    version: 4,
    characters: parseArray(data.characters).map((char) => ({
      ...char,
      enhanced: false,
      artifactIDs: Array_.truthify(char.artifactIDs),
    })),
    weapons: parseArray(data.weapons).map(({ owner, ...rest }) => ({
      ...rest,
      owner: owner ?? undefined,
    })),
    artifacts: parseArray(data.artifacts).map(({ owner, ...rest }) => ({
      ...rest,
      owner: owner ?? undefined,
    })),
    setups: parseArray(data.setups).map((setup) =>
      isComplexSetup(setup) ? setup : convertSetup(setup)
    ),
  };
}
