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
  configTalentEvent,
} from "@Backend";
import type {
  Character,
  ElementModCtrl,
  HitEvent,
  PartyData,
  SimulationMember,
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationBonus,
  SimulationTarget,
} from "@Src/types";

// #to-do: clean up
import { getNormalsConfig, AttackPatternConf, type NormalsConfig } from "@Src/backend/calculation";
import { $AppWeapon } from "@Src/services";
import { pickProps, removeEmpty } from "@Src/utils";
import { SimulatorTotalAttributeControl } from "./total-attribute-control";

export type OnChangeTotalAttr = (totalAttr: TotalAttribute) => void;

export type OnChangeBonuses = (bonuses: SimulationBonus[]) => void;

export type ConfigTalentHitEventArgs = {
  talent: LevelableTalentType;
  pattern: AttackPattern;
  item: CalcItem;
  elmtModCtrls?: Partial<ElementModCtrl>;
  partyData: PartyData;
  target: SimulationTarget;
};

export class MemberControl {
  info: Character;
  data: AppCharacter;
  totalAttr: TotalAttributeControl;
  private normalsConfig: NormalsConfig = {};
  private buffApplier: SimulatorBuffApplier;
  private attrBonus: SimulationAttributeBonus[] = [];
  private attkBonus: SimulationAttackBonus[] = [];

  private onChangeTotalAttrTimeoutId: NodeJS.Timeout | undefined;
  private onChangeTotalAttr: OnChangeTotalAttr | undefined;

  private onChangeBonusTimeoutId: NodeJS.Timeout | undefined;
  private onChangeBonuses: OnChangeBonuses | undefined;

  constructor(member: SimulationMember, appChar: AppCharacter, partyData: PartyData) {
    const char: Character = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB"]);
    const appWeapon = $AppWeapon.get(member.weapon.code)!;
    const totalAttrCtrl = new SimulatorTotalAttributeControl();

    totalAttrCtrl.construct(char, appChar, member.weapon, appWeapon, member.artifacts);

    this.info = char;
    this.data = appChar;
    this.totalAttr = totalAttrCtrl.clone();
    this.buffApplier = new SimulatorBuffApplier({ char, appChar, partyData }, this.totalAttr);
  }

  getBonuses = () => {
    return (this.attrBonus as SimulationBonus[]).concat(this.attkBonus);
  };

  listenChanges = (onChangeTotalAttr: OnChangeTotalAttr, onChangeBonuses: OnChangeBonuses) => {
    this.onChangeTotalAttr = onChangeTotalAttr;
    this.onChangeBonuses = onChangeBonuses;
  };

  apply = (performerName: string, buff: CharacterBuff, inputs: number[]) => {
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

    const trigger = {
      character: performerName,
      modifier: buff.src,
    };

    this.buffApplier.applyCharacterBuff({
      buff,
      description: ``,
      inputs,
      applyAttrBonus: (bonus) => {
        const add = bonus.stable ? this.totalAttr.addStable : this.totalAttr.addUnstable;

        add(bonus.stat, bonus.value, bonus.description);

        this.attrBonus.push({
          stable: bonus.stable,
          toStat: bonus.stat,
          value: bonus.value,
          trigger,
        });

        clearTimeout(this.onChangeTotalAttrTimeoutId);
        clearTimeout(this.onChangeBonusTimeoutId);

        this.onChangeTotalAttrTimeoutId = setTimeout(() => {
          this.onChangeTotalAttr?.(this.totalAttr.finalize());
        }, 50);

        this.onChangeBonusTimeoutId = setTimeout(() => {
          this.onChangeBonuses?.(this.getBonuses());
        }, 50);
      },
      applyAttkBonus: (bonus) => {
        this.attkBonus.push({
          toType: bonus.module,
          toKey: bonus.path,
          value: bonus.value,
          trigger,
        });

        clearTimeout(this.onChangeBonusTimeoutId);

        this.onChangeBonusTimeoutId = setTimeout(() => {
          this.onChangeBonuses?.(this.getBonuses());
        }, 50);
      },
    });
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

    for (const bonus of this.attkBonus) {
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

    return configTalentEvent({
      itemConfig: configCalcItem(args.item, {
        absorption: null,
        reaction: null,
        infuse_reaction: null,
        ...(args.elmtModCtrls ? removeEmpty(args.elmtModCtrls) : undefined),
      }),
      level,
      totalAttr,
      attBonus,
      info,
      target: args.target,
    });
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
      elmtModCtrls,
      partyData,
      target,
    });
  };
}
