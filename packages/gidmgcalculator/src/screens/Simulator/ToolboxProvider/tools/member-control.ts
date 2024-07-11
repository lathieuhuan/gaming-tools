import {
  AppCharacter,
  AppWeapon,
  AppliedAttackBonus,
  AppliedAttributeBonus,
  AttackBonusControl,
  AttackPattern,
  AttackPatternConf,
  CalcItem,
  CalcItemCalculator,
  CharacterCalc,
  LevelableTalentType,
  ModifierAffectType,
  NORMAL_ATTACKS,
  NormalsConfig,
  ResistanceReductionControl,
  TotalAttribute,
  TotalAttributeControl,
  getNormalsConfig,
} from "@Backend";
import type {
  ElementModCtrl,
  HitEvent,
  ModifyEvent,
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";

import { pickProps, removeEmpty } from "@Src/utils";
import { SimulatorBuffApplier } from "./simulator-buff-applier";

export type OnChangeTotalAttr = (totalAttrCtrl: TotalAttribute) => void;

export type OnChangeBonuses = (attrBonus: SimulationAttributeBonus[], attkBonus: SimulationAttackBonus[]) => void;

type ModifyResult = {
  affect: ModifierAffectType | null;
  attrBonuses: AppliedAttributeBonus[];
  attkBonuses: AppliedAttackBonus[];
  source: string;
};

export class MemberControl extends SimulatorBuffApplier {
  info: SimulationMember;
  data: AppCharacter;
  private totalAttrCtrl: TotalAttributeControl;
  private rootTotalAttr: TotalAttributeControl;
  private normalsConfig: NormalsConfig = {};

  get totalAttr() {
    return this.totalAttrCtrl.finalize();
  }

  constructor(member: SimulationMember, appChar: AppCharacter, appWeapon: AppWeapon, partyData: SimulationPartyData) {
    super({ char: member, appChar, partyData });

    this.rootTotalAttr = new TotalAttributeControl();
    this.rootTotalAttr.construct(member, appChar, member.weapon, appWeapon, member.artifacts);

    this.info = member;
    this.data = appChar;

    this.totalAttrCtrl = this.rootTotalAttr.clone();
    this.getTotalAttrFromSelf = this.totalAttrCtrl.getTotal;
  }

  private resetTotalAttr = () => {
    this.totalAttrCtrl = this.rootTotalAttr.clone();
    this.getTotalAttrFromSelf = this.totalAttrCtrl.getTotal;
  };

  // reset = () => {
  //   this.resetTotalAttr();
  //   this.attrBonus = [];
  //   this.attkBonus = [];

  //   this.onChangeTotalAttr?.(this.totalAttrCtrl.finalize());
  // };

  // ========== MODIFY ==========

  modify = (event: ModifyEvent, performerWeapon: AppWeapon): ModifyResult => {
    const { modifier } = event;
    const { inputs = [] } = modifier;

    if (modifier.type === "CHARACTER") {
      // #to-do: check if character can do this event (in case events are imported
      // but the modifier is not granted because of character's level/constellation)
      const buff = this?.data.buffs?.find((buff) => buff.index === modifier.id);

      if (buff) {
        const source = `${this.data.name} / ${buff.src}`;

        const bonuses = this.getAppliedCharacterBonuses({
          buff,
          description: source,
          inputs,
          fromSelf: true,
        });

        return {
          affect: buff.affect,
          ...bonuses,
          source,
        };
      }
    }
    if (modifier.type === "WEAPON") {
      const buff = performerWeapon.buffs?.find((buff) => buff.index === modifier.id);

      if (buff) {
        const source = `${this.data.name} / ${performerWeapon.name}`;

        const bonuses = this.getApplyWeaponBonuses({
          buff,
          refi: 1,
          description: source,
          inputs,
          fromSelf: true,
        });

        return {
          affect: buff.affect,
          ...bonuses,
          source,
        };
      }
    }
    if (modifier.type === "ARTIFACT") {
      //
    }

    return {
      affect: null,
      attrBonuses: [],
      attkBonuses: [],
      source: "",
    };
  };

  applySimulationBonuses = () => {
    this.resetTotalAttr();

    for (const bonus of this.attrBonus) {
      const add = bonus.isStable ? this.totalAttrCtrl.addStable : this.totalAttrCtrl.addUnstable;
      add(bonus.toStat, bonus.value, bonus.description);
    }
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
    const totalAttr = this.totalAttr;

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

export type ConfigTalentHitEventArgs = {
  talent: LevelableTalentType;
  pattern: AttackPattern;
  item: CalcItem;
  elmtModCtrls?: Partial<ElementModCtrl>;
  attkBonus: SimulationAttackBonus[];
  partyData: SimulationPartyData;
  target: SimulationTarget;
};
