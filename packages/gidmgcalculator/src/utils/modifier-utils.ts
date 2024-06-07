import type { ModInputConfig, ModInputType, ModifierAffectType, WeaponType } from "@Backend";
import type { ArtifactDebuffCtrl, ElementModCtrl, ModifierCtrl } from "@Src/types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";

const DEFAULT_INITIAL_VALUES: Record<ModInputType, number> = {
  CHECK: 0,
  LEVEL: 1,
  TEXT: 0,
  SELECT: 1,
  STACKS: 1,
  ANEMOABLE: 0,
  DENDROABLE: 0,
};

export class Modifier_ {
  static getDefaultInitialValue(type: ModInputType) {
    return DEFAULT_INITIAL_VALUES[type] ?? 0;
  }

  static createElmtModCtrls(): ElementModCtrl {
    return {
      infuse_reaction: null,
      reaction: null,
      superconduct: false,
      resonances: [],
      absorption: null,
    };
  }

  static createModCtrl = (mod: Modifier, forSelf: boolean) => {
    const ctrl: ModifierCtrl = { index: mod.index, activated: false };

    if (mod.inputConfigs) {
      const initialValues = [];

      for (const config of mod.inputConfigs) {
        if (!config.for || config.for !== (forSelf ? "FOR_TEAM" : "FOR_SELF")) {
          initialValues.push(config.initialValue ?? Modifier_.getDefaultInitialValue(config.type));
        }
      }
      if (initialValues.length) ctrl.inputs = initialValues;
    }
    return ctrl;
  };

  static createCharacterModCtrls(forSelf: boolean, name: string) {
    const buffCtrls: ModifierCtrl[] = [];
    const debuffCtrls: ModifierCtrl[] = [];
    const { buffs = [], debuffs = [] } = $AppCharacter.get(name) || {};

    for (const buff of buffs) {
      const incompatibleAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

      if (buff.affect !== incompatibleAffect) {
        buffCtrls.push(createModCtrl(buff, forSelf));
      }
    }
    for (const debuff of debuffs) {
      if (!forSelf && debuff.affect === "SELF") {
        continue;
      }
      debuffCtrls.push(createModCtrl(debuff, forSelf));
    }
    return [buffCtrls, debuffCtrls];
  }

  static createWeaponBuffCtrls(forSelf: boolean, weapon: { type: WeaponType; code: number }) {
    return createItemBuffCtrls(forSelf, $AppWeapon.get(weapon.code));
  }

  static createArtifactBuffCtrls(forSelf: boolean, artifact?: { code?: number }) {
    return artifact?.code ? createItemBuffCtrls(forSelf, $AppArtifact.getSet(artifact.code)) : [];
  }

  static createArtifactDebuffCtrls(): ArtifactDebuffCtrl[] {
    return [
      { code: 15, activated: false, index: 0, inputs: [0] },
      { code: 33, activated: false, index: 0 },
    ];
  }
}

type Modifier = {
  index: number;
  inputConfigs?: ModInputConfig[];
};
function createModCtrl(mod: Modifier, forSelf: boolean) {
  const ctrl: ModifierCtrl = { index: mod.index, activated: false };

  if (mod.inputConfigs) {
    const initialValues = [];

    for (const config of mod.inputConfigs) {
      if (!config.for || config.for !== (forSelf ? "FOR_TEAM" : "FOR_SELF")) {
        initialValues.push(config.initialValue ?? Modifier_.getDefaultInitialValue(config.type));
      }
    }
    if (initialValues.length) ctrl.inputs = initialValues;
  }
  return ctrl;
}

interface RefModifier {
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
}
function createItemBuffCtrls(forSelf: boolean, entity?: { buffs?: RefModifier[] }) {
  const buffCtrls: ModifierCtrl[] = [];

  if (entity?.buffs) {
    for (const buff of entity.buffs) {
      const incompatibleAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

      if (buff.affect !== incompatibleAffect) {
        buffCtrls.push(createModCtrl(buff, forSelf));
      }
    }
  }
  return buffCtrls;
}
