import { $AppCharacter, $AppData } from "@Src/services";
import type {
  ArtifactDebuffCtrl,
  ElementModCtrl,
  ModInputConfig,
  ModInputType,
  ModifierAffectType,
  ModifierCtrl,
  WeaponType,
} from "@Src/types";

const DEFAULT_INITIAL_VALUES: Record<ModInputType, number> = {
  check: 0,
  level: 1,
  text: 0,
  select: 1,
  stacks: 1,
  anemoable: 0,
  dendroable: 0,
};

type Modifier = {
  index: number;
  inputConfigs?: ModInputConfig[];
};
function createModCrtl(mod: Modifier, forSelf: boolean) {
  const ctrl: ModifierCtrl = { index: mod.index, activated: false };

  if (mod.inputConfigs) {
    const initialValues = [];

    for (const config of mod.inputConfigs) {
      if (config.for !== (forSelf ? "team" : "self")) {
        initialValues.push(config.initialValue ?? ModifierUtils.getDefaultInitialValue(config.type));
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
        buffCtrls.push(createModCrtl(buff, forSelf));
      }
    }
  }
  return buffCtrls;
}

class ModifierUtils {
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

  static createCharacterModCtrls(forSelf: boolean, name: string) {
    const buffCtrls: ModifierCtrl[] = [];
    const debuffCtrls: ModifierCtrl[] = [];
    const { buffs = [], debuffs = [] } = $AppCharacter.get(name) || {};

    for (const buff of buffs) {
      const incompatibleAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

      if (buff.affect !== incompatibleAffect) {
        buffCtrls.push(createModCrtl(buff, forSelf));
      }
    }
    for (const debuff of debuffs) {
      if (!forSelf && debuff.affect === "SELF") {
        continue;
      }
      debuffCtrls.push(createModCrtl(debuff, forSelf));
    }
    return [buffCtrls, debuffCtrls];
  }

  static createWeaponBuffCtrls(forSelf: boolean, weapon: { type: WeaponType; code: number }) {
    return createItemBuffCtrls(forSelf, $AppData.getWeapon(weapon.code));
  }

  static createArtifactBuffCtrls(forSelf: boolean, artifact?: { code?: number }) {
    return artifact?.code ? createItemBuffCtrls(forSelf, $AppData.getArtifactSet(artifact.code)) : [];
  }

  static createArtifactDebuffCtrls(): ArtifactDebuffCtrl[] {
    return [
      { code: 15, activated: false, index: 0, inputs: [0] },
      { code: 33, activated: false, index: 0 },
    ];
  }
}

export default ModifierUtils;
