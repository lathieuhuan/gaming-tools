import {
  AppCharacter,
  AttackBonusControl,
  AttackPattern,
  CalcItem,
  CharacterBuff,
  CharacterCalc,
  LevelableTalentType,
  NORMAL_ATTACKS,
  SimulatorBuffApplier,
  TotalAttribute,
  TotalAttributeControl,
  ResistanceReductionControl,
} from "@Backend";
import type {
  Character,
  ElementModCtrl,
  HitEvent,
  PartyData,
  SimulationMember,
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationTarget,
  SimulationBonusCore,
} from "@Src/types";

// #to-do: clean up
import { getNormalsConfig, AttackPatternConf, type NormalsConfig, CalcItemCalculator } from "@Src/backend/calculation";
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
  totalAttr: TotalAttributeControl;
  attrBonus: SimulationAttributeBonus[] = [];
  attkBonus: SimulationAttackBonus[] = [];
  private buffApplier: SimulatorBuffApplier;
  private normalsConfig: NormalsConfig = {};

  private onChangeTotalAttr: OnChangeTotalAttr | undefined;
  private onChangeBonuses: OnChangeBonuses | undefined;

  private rootTotalAttr: SimulatorTotalAttributeControl;

  constructor(member: SimulationMember, appChar: AppCharacter, partyData: PartyData) {
    const char: Character = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB"]);
    const appWeapon = $AppWeapon.get(member.weapon.code)!;
    this.rootTotalAttr = new SimulatorTotalAttributeControl();

    this.rootTotalAttr.construct(char, appChar, member.weapon, appWeapon, member.artifacts);

    this.info = char;
    this.data = appChar;

    this.totalAttr = this.rootTotalAttr.clone();
    this.buffApplier = new SimulatorBuffApplier({ char, appChar, partyData }, this.totalAttr);
  }

  listenChanges = (onChangeTotalAttr: OnChangeTotalAttr, onChangeBonuses: OnChangeBonuses) => {
    this.onChangeTotalAttr = onChangeTotalAttr;
    this.onChangeBonuses = onChangeBonuses;
  };

  reset = (partyData: PartyData) => {
    this.totalAttr = this.rootTotalAttr.clone();
    this.buffApplier = new SimulatorBuffApplier({ char: this.info, appChar: this.data, partyData }, this.totalAttr);
    this.attrBonus = [];
    this.attkBonus = [];

    this.onChangeTotalAttr?.(this.totalAttr.finalize());
  };

  private updateBonus<T extends SimulationBonusCore>(bonuses: T[], bonus: T) {
    const existedIndex = bonuses.findIndex(
      (_bonus) =>
        _bonus.trigger.character === bonus.trigger.character && _bonus.trigger.modifier === bonus.trigger.modifier
    );

    if (existedIndex === -1) {
      bonuses.push(bonus);
    } else {
      bonuses[existedIndex] = {
        ...bonuses[existedIndex],
        value: bonus.value,
      };
    }
  }

  applyCharacterBuff = (performerName: string, buff: CharacterBuff, inputs: number[]) => {
    if (performerName === this.data.name) {
      // #to-do: implement normalsConfig to disable attack pattern
      this.normalsConfig = getNormalsConfig(
        {
          char: this.info,
          appChar: this.data,
          partyData: [],
        },
        []
      );
    }

    let attrBonusChanged = false;
    let attkBonusChanged = false;

    const trigger = {
      character: performerName,
      modifier: buff.src,
    };

    this.buffApplier.applyCharacterBuff({
      buff,
      description: "",
      inputs,
      applyAttrBonus: (bonus) => {
        attrBonusChanged = true;

        this.updateBonus(this.attrBonus, {
          type: "ATTRIBUTE",
          stable: bonus.stable,
          toStat: bonus.stat,
          value: bonus.value,
          trigger,
        });
      },
      applyAttkBonus: (bonus) => {
        attkBonusChanged = true;

        this.updateBonus(this.attkBonus, {
          type: "ATTACK",
          toType: bonus.module,
          toKey: bonus.path,
          value: bonus.value,
          trigger,
        });
      },
    });

    if (attrBonusChanged) {
      this.totalAttr = this.rootTotalAttr.clone();

      for (const bonus of this.attrBonus) {
        const add = bonus.stable ? this.totalAttr.addStable : this.totalAttr.addUnstable;
        add(bonus.toStat, bonus.value, `${bonus.trigger.character} / ${bonus.trigger.modifier}`);
      }
      this.onChangeTotalAttr?.(this.totalAttr.finalize());
    }
    if (attrBonusChanged || attkBonusChanged) {
      this.onChangeBonuses?.(structuredClone(this.attrBonus), structuredClone(this.attkBonus));
    }
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
