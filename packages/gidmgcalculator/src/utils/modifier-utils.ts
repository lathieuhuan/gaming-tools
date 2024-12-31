import {
  GeneralCalc,
  type ModInputConfig,
  type ModInputType,
  type ModifierAffectType,
  type WeaponType,
} from "@Backend";
import type { Artifact, ArtifactModCtrl, ElementModCtrl, ModifierCtrl } from "@Src/types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";

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

  static createModCtrlInpus(inputConfigs: ModInputConfig[] = [], forSelf = true, useMaxValue = false) {
    const initialValues = [];

    for (const config of inputConfigs) {
      if (!config.for || config.for !== (forSelf ? "FOR_TEAM" : "FOR_SELF")) {
        const value = (useMaxValue ? config.max : config.initialValue) ?? this.getDefaultInitialValue(config.type);
        initialValues.push(value);
      }
    }
    return initialValues.length ? initialValues : undefined;
  }

  static createModCtrl(mod: Modifier, forSelf: boolean): ModifierCtrl {
    const inputs = this.createModCtrlInpus(mod.inputConfigs, forSelf);

    return {
      index: mod.index,
      activated: false,
      ...(inputs ? { inputs } : null),
    };
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

  static createItemBuffCtrls(forSelf: boolean, entity?: { buffs?: RefModifier[] }) {
    const buffCtrls: ModifierCtrl[] = [];

    if (entity?.buffs) {
      for (const buff of entity.buffs) {
        const incompatibleAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

        if (buff.affect !== incompatibleAffect) {
          buffCtrls.push(this.createModCtrl(buff, forSelf));
        }
      }
    }
    return buffCtrls;
  }

  static createWeaponBuffCtrls(forSelf: boolean, weapon: { type: WeaponType; code: number }) {
    return this.createItemBuffCtrls(forSelf, $AppWeapon.get(weapon.code));
  }

  static createMainArtifactBuffCtrls(artifacts: (Artifact | null)[]) {
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
    const artBuffCtrls: ArtifactModCtrl[] = [];

    for (const setBonus of setBonuses) {
      const { buffs = [] } = $AppArtifact.getSet(setBonus.code) || {};

      for (const buff of buffs) {
        const { bonusLv = 1 } = buff;

        if (buff.affect !== "TEAMMATE" && setBonus.bonusLv >= bonusLv) {
          artBuffCtrls.push({
            code: setBonus.code,
            ...this.createModCtrl(buff, true),
          });
        }
      }
    }
    return artBuffCtrls;
  }

  static createArtifactBuffCtrls(forSelf: boolean, artifact?: { code?: number }) {
    return artifact?.code ? this.createItemBuffCtrls(forSelf, $AppArtifact.getSet(artifact.code)) : [];
  }

  static createArtifactDebuffCtrls(): ArtifactModCtrl[] {
    return [
      { code: 15, activated: false, index: 0, inputs: [0] },
      { code: 33, activated: false, index: 0 },
    ];
  }
}
