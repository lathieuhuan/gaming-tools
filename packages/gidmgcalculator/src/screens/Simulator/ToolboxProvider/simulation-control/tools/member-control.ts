import {
  ActualAttackPattern,
  AppWeapon,
  AppliedAttackBonus,
  AppliedAttributeBonus,
  AttackBonusesControl,
  AttackPattern,
  AttackReaction,
  CalcItem,
  CalcItemRecord,
  CharacterCalc,
  LevelableTalentType,
  ModifierAffectType,
  NORMAL_ATTACKS,
  NormalAttacksConfig,
  ResistanceReductionControl,
  getCalcItemCalculator,
} from "@Backend";
import type {
  ElementModCtrl,
  HitEvent,
  ModifyEvent,
  SimulationAttackBonus,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";
import type { Performer } from "../simulation-control.types";

import Object_ from "@Src/utils/object-utils";
import { MemberBonusesControl } from "./member-bonuses-control";
import { CalculationFinalResultAttackItem, CalculationFinalResultItem } from "@Src/backend/types";

/**
 * This class is for simulating member's actions
 */
export class MemberControl extends MemberBonusesControl {
  private naConfig: NormalAttacksConfig = {};

  // ========== MODIFY ==========

  innateModify = () => {
    // for innate dynamic buff
  };

  /**
   * @return affect: null if cannot find the buff
   */
  modify = (modifier: ModifyEvent["modifier"], performerWeapon: AppWeapon): ModifyResult => {
    const { inputs = [] } = modifier;
    const characterPerform: Performer = {
      type: "CHARACTER",
      title: this.data.name,
      icon: this.data.icon,
    };

    switch (modifier.type) {
      case "CHARACTER": {
        // #to-do: check if character can do this event (in case events are imported
        // but the modifier is not granted because of character's level/constellation)
        const buff = this.data.buffs?.find((buff) => buff.index === modifier.id);
        if (!buff) break;

        const bonuses = this.bonusGetter.getAppliedBonuses(
          buff,
          {
            inputs,
            fromSelf: true,
          },
          `${this.data.name} / ${buff.src}`
        );

        return {
          affect: buff.affect,
          ...bonuses,
          performers: [characterPerform],
          source: buff.src,
        };
      }
      case "WEAPON": {
        const buff = performerWeapon.buffs?.find((buff) => buff.index === modifier.id);
        if (!buff) break;

        const bonuses = this.bonusGetter.getAppliedBonuses(
          buff,
          {
            refi: 1,
            inputs,
            fromSelf: true,
          },
          `${this.data.name} / ${performerWeapon.name}`
        );

        return {
          affect: buff.affect,
          ...bonuses,
          performers: [
            characterPerform,
            {
              type: "WEAPON",
              title: performerWeapon.name,
              icon: performerWeapon.icon,
            },
          ],
          source: performerWeapon.name,
        };
      }
      case "ARTIFACT":
        break;
    }

    return {
      affect: null,
      attrBonuses: [],
      attkBonuses: [],
      performers: [],
      source: "",
    };
  };

  // ========== HIT ==========

  private getHitInfo = (talent: LevelableTalentType, calcItemId: string) => {
    const { calcList } = this.data;
    let hitInfo:
      | {
          pattern: AttackPattern;
          item: CalcItem;
        }
      | undefined = undefined;

    switch (talent) {
      case "NAs":
        for (const type of NORMAL_ATTACKS) {
          const found = calcList[type].find((calcItem) => calcItem.name === calcItemId);
          if (found) {
            hitInfo = {
              item: found,
              pattern: type,
            };
            break;
          }
        }
        break;
      default: {
        const item = calcList[talent].find((calcItem) => calcItem.name === calcItemId);

        if (item) {
          hitInfo = {
            item,
            pattern: talent,
          };
        }
      }
    }
    return hitInfo;
  };

  configTalentHitEvent = (args: ConfigTalentHitEventArgs): TalentEventConfig => {
    const attkBonusesCtrl = new AttackBonusesControl();

    for (const bonus of args.attkBonus) {
      attkBonusesCtrl.add(bonus);
    }

    const calcInfo = {
      char: this.info,
      appChar: this.data,
      partyData: args.partyData,
    };

    const elmtModCtrls = {
      absorption: null,
      reaction: null,
      infuse_reaction: null,
      ...(args.elmtModCtrls ? Object_.omitEmptyProps(args.elmtModCtrls) : undefined),
    };

    const resistances = new ResistanceReductionControl(calcInfo).applyTo(args.target);

    const calculator = getCalcItemCalculator(
      args.target.level,
      calcInfo,
      this.naConfig,
      {
        element: "phys",
      },
      this.totalAttr,
      attkBonusesCtrl.genArchive(),
      resistances
    );

    const { disabled, calculate } = calculator.genAttPattCalculator(args.pattern);
    const result = calculate(args.item, elmtModCtrls) as CalculationFinalResultAttackItem;

    return {
      disabled,
      ...result,
    };
  };

  hit = (event: HitEvent, partyData: SimulationPartyData, target: SimulationTarget) => {
    const hitInfo = this.getHitInfo(event.talent, event.calcItemId);
    if (!hitInfo) return null;

    const elmtModCtrls = {
      absorption: null,
      reaction: null,
      infuse_reaction: null,
      ...(event.elmtModCtrls ? Object_.omitEmptyProps(event.elmtModCtrls) : undefined),
    };

    const result = this.configTalentHitEvent({
      talent: event.talent,
      ...hitInfo,
      attkBonus: this.attkBonuses,
      elmtModCtrls,
      partyData,
      target,
    });
    const damage = result.average;

    return {
      name: hitInfo.item.name,
      damage: Math.round(Array.isArray(damage) ? damage.reduce((t, d) => t + d, 0) : damage),
      ...Object_.pickProps(result, ["disabled", "attPatt", "attElmt", "reaction"]),
    };
  };
}

type ModifyResult = {
  affect: ModifierAffectType | null;
  attrBonuses: AppliedAttributeBonus[];
  attkBonuses: AppliedAttackBonus[];
  source: string;
  performers: Performer[];
};

export type ConfigTalentHitEventArgs = {
  talent: LevelableTalentType;
  pattern: AttackPattern;
  item: CalcItem;
  elmtModCtrls?: Partial<ElementModCtrl>;
  attkBonus: SimulationAttackBonus[];
  partyData: SimulationPartyData;
  target: SimulationTarget;
};

export type TalentEventConfig = CalculationFinalResultAttackItem & {
  disabled: boolean;
};
