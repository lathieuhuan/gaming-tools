import type {
  Artifact,
  ArtifactModCtrl,
  CalcSetup,
  ElementModCtrl,
  ModifierCtrl,
  TeamBuffCtrl,
} from "@/types";
import type {
  AppCharacter,
  EntityModifier,
  ModInputConfig,
  ModInputType,
  ModifierAffectType,
  WeaponType,
} from "@Calculation";
import type { PartiallyRequiredOnly } from "rond";

import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@/services";
import { GeneralCalc } from "@Calculation";
import Array_ from "./Array";
import Entity_ from "./Entity";

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

type RefModifier = EntityModifier & {
  affect: ModifierAffectType;
};

export default class Modifier_ {
  static readonly MS_ASCENDANT_BUFF_ID = "moon_ascendant";

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
        let value = useMaxValue ? config.max : config.init;

        if (value === undefined) {
          const [firstOption] = config.options ?? [];

          if (typeof firstOption === "number") {
            value = firstOption;
          } else {
            value = this.getDefaultInitialValue(config.type);
          }
        }

        initialValues.push(value);
      }
    }

    return initialValues;
  }

  static createModCtrl(mod: EntityModifier, forSelf: boolean): ModifierCtrl {
    const inputs = this.createModCtrlInputs(mod.inputConfigs, forSelf);

    return {
      index: mod.index,
      activated: false,
      ...(mod.teamBuffId ? { teamBuffId: mod.teamBuffId } : null),
      ...(inputs.length ? { inputs } : null),
    };
  }

  static createTeamBuffCtrls(
    setup: PartiallyRequiredOnly<CalcSetup, "char" | "party">,
    data = Entity_.getAppCharacters(setup.char.name, setup.party)
  ): TeamBuffCtrl[] {
    const { artBuffCtrls = [] } = setup;

    // Find available team buff ids

    let moonsignLv = data[setup.char.name].faction?.includes("moonsign") ? 1 : 0;
    const teamBuffIds = new Set<string>();
    const teammates = Array_.truthify(setup.party);

    for (const teammate of teammates) {
      if (data[teammate.name].faction?.includes("moonsign")) {
        moonsignLv++;
      }
    }

    if (moonsignLv >= 2) {
      teamBuffIds.add(this.MS_ASCENDANT_BUFF_ID);
    }

    for (const ctrl of artBuffCtrls) {
      if (ctrl.teamBuffId) {
        teamBuffIds.add(ctrl.teamBuffId);
      }
    }

    for (const teammate of teammates) {
      for (const ctrl of teammate.artifact.buffCtrls) {
        if (ctrl.teamBuffId) {
          teamBuffIds.add(ctrl.teamBuffId);
        }
      }
    }

    // Turn ids into ctrls based on $AppData.teamBuffs

    const teamBuffCtrls: TeamBuffCtrl[] = [];

    for (const buff of $AppData.teamBuffs) {
      if (teamBuffIds.has(buff.id)) {
        const { index, ...rest } = Modifier_.createModCtrl({ ...buff, index: 0 }, false);

        teamBuffCtrls.push({
          id: buff.id,
          ...rest,
        });
      }
    }

    return teamBuffCtrls;
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

  static createCharacterModCtrls(
    nameOrData: string | AppCharacter,
    forSelf: boolean
  ): [ModifierCtrl[], ModifierCtrl[]] {
    const data = typeof nameOrData === "string" ? $AppCharacter.get(nameOrData) : nameOrData;
    const { buffs = [], debuffs = [] } = data || {};
    const buffCtrls: ModifierCtrl[] = [];
    const debuffCtrls: ModifierCtrl[] = [];
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
