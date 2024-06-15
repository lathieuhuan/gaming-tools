import {
  AppCharacter,
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
  getNormalsConfig,
} from "@Backend";
import type {
  Character,
  ElementModCtrl,
  HitEvent,
  PartyData,
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationMember,
  SimulationTarget,
} from "@Src/types";

import { $AppWeapon } from "@Src/services";
import { pickProps, removeEmpty } from "@Src/utils";
import { SimulatorTotalAttributeControl } from "./total-attribute-control";

export type OnChangeTotalAttr = (totalAttr: TotalAttribute) => void;

export type OnChangeBonuses = (attrBonus: SimulationAttributeBonus[], attkBonus: SimulationAttackBonus[]) => void;

export type ConfigTalentHitEventArgs = {
  talent: LevelableTalentType;
  pattern: AttackPattern;
  item: CalcItem;
  elmtModCtrls?: Partial<ElementModCtrl>;
  attkBonus: SimulationAttackBonus[];
  partyData: PartyData;
  target: SimulationTarget;
};

export class MemberControl {
  info: Character;
  data: AppCharacter;
  totalAttr: SimulatorTotalAttributeControl;
  attrBonus: SimulationAttributeBonus[] = [];
  attkBonus: SimulationAttackBonus[] = [];
  buffApplier: SimulatorBuffApplier;
  private normalsConfig: NormalsConfig = {};

  onChangeTotalAttr: OnChangeTotalAttr | undefined;
  onChangeBonuses: OnChangeBonuses | undefined;

  constructor(member: SimulationMember, appChar: AppCharacter, partyData: PartyData) {
    const char: Character = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB"]);
    const appWeapon = $AppWeapon.get(member.weapon.code)!;

    const rootTotalAttr = new SimulatorTotalAttributeControl();

    rootTotalAttr.construct(char, appChar, member.weapon, appWeapon, member.artifacts);

    this.info = char;
    this.data = appChar;

    this.totalAttr = rootTotalAttr.clone();
    this.buffApplier = new SimulatorBuffApplier({ char, appChar, partyData }, this.totalAttr);
  }

  listenChanges = (onChangeTotalAttr: OnChangeTotalAttr, onChangeBonuses: OnChangeBonuses) => {
    this.onChangeTotalAttr = onChangeTotalAttr;
    this.onChangeBonuses = onChangeBonuses;
  };

  reset = () => {
    this.totalAttr.reset();
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

    const { configCalcItem } = AttackPatternConf({
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
      ...pickProps(itemConfig, ["attElmt", "attPatt", "record"]),
    };
  };

  hit = (event: HitEvent, partyData: PartyData, target: SimulationTarget) => {
    const hitInfo = this.getHitInfo(event.talent, event.calcItemId);
    if (!hitInfo) return null;

    const elmtModCtrls = {
      absorption: null,
      reaction: null,
      infuse_reaction: null,
      ...(event.elmtModCtrls ? removeEmpty(event.elmtModCtrls) : undefined),
    };

    return this.configTalentHitEvent({
      talent: event.talent,
      ...hitInfo,
      attkBonus: this.attkBonus,
      elmtModCtrls,
      partyData,
      target,
    });
  };
}
