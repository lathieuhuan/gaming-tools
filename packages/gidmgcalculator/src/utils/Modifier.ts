import type { ModInputConfig, ModInputType, ModifierAffectType, WeaponType } from "@Calculation";
import type { Artifact, ArtifactModCtrl, ElementModCtrl, ModifierCtrl } from "@/types";

import { GeneralCalc } from "@Calculation";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";

const DEFAULT_INITIAL_VALUES: Record<ModInputType, number> = {
  CHECK: 0,
  LEVEL: 1,
  TEXT: 0,
  SELECT: 1,
  STACKS: 1,
  ANEMOABLE: 0,
  DENDROABLE: 0,
  ELEMENTAL: 0,
};

type Modifier = {
  index: number;
  inputConfigs?: ModInputConfig[];
};

type RefModifier = Modifier & {
  affect: ModifierAffectType;
};

export default class Modifier_ {
  static getDefaultInitialValue(type: ModInputType) {
    return DEFAULT_INITIAL_VALUES[type] ?? 0;
  }

  static createModCtrlInputs(
    inputConfigs: ModInputConfig[] = [],
    forSelf = true,
    useMaxValue = false
  ) {
    const forTarget = forSelf ? "FOR_TEAM" : "FOR_SELF";
    const initialValues = [];

    for (const config of inputConfigs) {
      if (!config.for || config.for !== forTarget) {
        const value =
          (useMaxValue ? config.max : config.init) ?? this.getDefaultInitialValue(config.type);

        initialValues.push(value);
      }
    }

    return initialValues;
  }

  static createModCtrl(mod: Modifier, forSelf: boolean): ModifierCtrl {
    const inputs = this.createModCtrlInputs(mod.inputConfigs, forSelf);

    return {
      index: mod.index,
      activated: false,
      ...(inputs.length ? { inputs } : null),
    };
  }

  static createElmtModCtrls(): ElementModCtrl {
    return {
      resonances: [],
      superconduct: false,
      reaction: null,
      infuse_reaction: null,
      absorb_reaction: null,
      absorption: null,
    };
  }

  static createCharacterModCtrls(name: string, forSelf: boolean): [ModifierCtrl[], ModifierCtrl[]] {
    const buffCtrls: ModifierCtrl[] = [];
    const debuffCtrls: ModifierCtrl[] = [];
    const { buffs = [], debuffs = [] } = $AppCharacter.get(name) || {};
    const incompatibleAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

    for (const buff of buffs) {
      if (buff.affect !== incompatibleAffect) {
        buffCtrls.push(this.createModCtrl(buff, forSelf));
      }
    }

    for (const debuff of debuffs) {
      if (!forSelf && debuff.affect === "SELF") {
        continue;
      }
      debuffCtrls.push(this.createModCtrl(debuff, forSelf));
    }

    return [buffCtrls, debuffCtrls];
  }

  static createItemBuffCtrls(entity: { buffs?: RefModifier[] } | undefined, forSelf: boolean) {
    const ctrls: ModifierCtrl[] = [];

    if (entity?.buffs) {
      const incompatibleAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

      for (const buff of entity.buffs) {
        if (buff.affect !== incompatibleAffect) {
          ctrls.push(this.createModCtrl(buff, forSelf));
        }
      }
    }

    return ctrls;
  }

  static createWeaponBuffCtrls(
    weapon: { type: WeaponType; code: number } | undefined,
    forSelf: boolean
  ) {
    return weapon?.code ? this.createItemBuffCtrls($AppWeapon.get(weapon.code), forSelf) : [];
  }

  static createMainArtifactBuffCtrls(
    artifacts: (Artifact | null)[],
    setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts)
  ) {
    const ctrls: ArtifactModCtrl[] = [];

    for (const setBonus of setBonuses) {
      const { buffs = [] } = $AppArtifact.getSet(setBonus.code) || {};

      for (const buff of buffs) {
        const { bonusLv = 1 } = buff;

        if (buff.affect !== "TEAMMATE" && setBonus.bonusLv >= bonusLv) {
          ctrls.push({
            code: setBonus.code,
            ...this.createModCtrl(buff, true),
          });
        }
      }
    }

    return ctrls;
  }

  static createArtifactBuffCtrls(artifact: { code?: number } | undefined, forSelf: boolean) {
    return artifact?.code
      ? this.createItemBuffCtrls($AppArtifact.getSet(artifact.code), forSelf)
      : [];
  }

  static createArtifactDebuffCtrls(): ArtifactModCtrl[] {
    return [
      { code: 15, activated: false, index: 0, inputs: [0] },
      { code: 33, activated: false, index: 0 },
    ];
  }
}
