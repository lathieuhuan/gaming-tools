import {
  AppCharacter,
  AppWeapon,
  AttackBonusControl,
  AttackPattern,
  AttackPatternConf,
  CalcItem,
  CalcItemCalculator,
  CharacterCalc,
  LevelableTalentType,
  NORMAL_ATTACKS,
  NormalsConfig,
  ResistanceReductionControl,
  SimulatorBuffApplier,
  TotalAttribute,
  TotalAttributeControl,
  getNormalsConfig,
} from "@Backend";
import type {
  ElementModCtrl,
  HitEvent,
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";

import { pickProps, removeEmpty } from "@Src/utils";

export type OnChangeTotalAttr = (totalAttr: TotalAttribute) => void;

export type OnChangeBonuses = (attrBonus: SimulationAttributeBonus[], attkBonus: SimulationAttackBonus[]) => void;

export type ConfigTalentHitEventArgs = {
  talent: LevelableTalentType;
  pattern: AttackPattern;
  item: CalcItem;
  elmtModCtrls?: Partial<ElementModCtrl>;
  attkBonus: SimulationAttackBonus[];
  partyData: SimulationPartyData;
  target: SimulationTarget;
};

export class MemberControl {
  info: SimulationMember;
  data: AppCharacter;
  totalAttr: TotalAttributeControl;
  attrBonus: SimulationAttributeBonus[] = [];
  attkBonus: SimulationAttackBonus[] = [];
  buffApplier: SimulatorBuffApplier;
  private rootTotalAttr: TotalAttributeControl;
  private normalsConfig: NormalsConfig = {};

  onChangeTotalAttr: OnChangeTotalAttr | undefined;
  onChangeBonuses: OnChangeBonuses | undefined;
  resetTotalAttr: () => void;

  constructor(member: SimulationMember, appChar: AppCharacter, appWeapon: AppWeapon, partyData: SimulationPartyData) {
    this.rootTotalAttr = new TotalAttributeControl();
    this.rootTotalAttr.construct(member, appChar, member.weapon, appWeapon, member.artifacts);

    this.info = member;
    this.data = appChar;

    this.totalAttr = this.rootTotalAttr.clone();
    this.buffApplier = new SimulatorBuffApplier({ char: member, appChar, partyData }, this.totalAttr);

    this.resetTotalAttr = () => {
      this.totalAttr = this.rootTotalAttr.clone();
      this.buffApplier = new SimulatorBuffApplier({ char: member, appChar, partyData }, this.totalAttr);
    };
  }

  listenChanges = (onChangeTotalAttr: OnChangeTotalAttr, onChangeBonuses: OnChangeBonuses) => {
    this.onChangeTotalAttr = onChangeTotalAttr;
    this.onChangeBonuses = onChangeBonuses;
  };

  reset = () => {
    this.resetTotalAttr();
    this.attrBonus = [];
    this.attkBonus = [];

    this.onChangeTotalAttr?.(this.totalAttr.finalize());
  };

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

  configTalentHitEvent = (args: ConfigTalentHitEventArgs) => {
    const attBonus = new AttackBonusControl();

    for (const bonus of args.attkBonus) {
      attBonus.add(bonus.toType, bonus.toKey, bonus.value, "");
    }

    const info = {
      char: this.info,
      appChar: this.data,
      partyData: args.partyData,
    };
    const level = CharacterCalc.getFinalTalentLv({ ...info, talentType: args.talent });
    const totalAttr = this.totalAttr.finalize();

    const { disabled, configCalcItem } = AttackPatternConf({
      appChar: this.data,
      normalsConfig: this.normalsConfig,
      totalAttr,
      attBonus,
      customInfusion: {
        element: "phys",
      },
    })(args.pattern);

    //

    const itemConfig = configCalcItem(args.item, {
      absorption: null,
      reaction: null,
      infuse_reaction: null,
      ...(args.elmtModCtrls ? removeEmpty(args.elmtModCtrls) : undefined),
    });

    const resistances = new ResistanceReductionControl().apply(args.target);

    const calculateCalcItem = CalcItemCalculator(info.char.level, args.target.level, totalAttr, resistances);

    const base = itemConfig.calculateBaseDamage(level);

    const result = calculateCalcItem({
      base,
      ...itemConfig,
    });

    return {
      damage: result.average,
      disabled: !!disabled,
      ...pickProps(itemConfig, ["attElmt", "attPatt", "reaction", "record"]),
    };
  };

  hit = (event: HitEvent, partyData: SimulationPartyData, target: SimulationTarget) => {
    const hitInfo = this.getHitInfo(event.talent, event.calcItemId);
    if (!hitInfo) return null;

    const elmtModCtrls = {
      absorption: null,
      reaction: null,
      infuse_reaction: null,
      ...(event.elmtModCtrls ? removeEmpty(event.elmtModCtrls) : undefined),
    };

    const config = this.configTalentHitEvent({
      talent: event.talent,
      ...hitInfo,
      attkBonus: this.attkBonus,
      elmtModCtrls,
      partyData,
      target,
    });

    return {
      name: hitInfo.item.name,
      ...config,
      damage: Math.round(Array.isArray(config.damage) ? config.damage.reduce((d, t) => t + d, 0) : config.damage),
    };
  };
}
