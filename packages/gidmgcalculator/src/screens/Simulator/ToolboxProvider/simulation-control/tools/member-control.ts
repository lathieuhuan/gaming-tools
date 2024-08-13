import {
  ActualAttackPattern,
  AppCharacter,
  AppWeapon,
  AppliedAttackBonus,
  AppliedAttributeBonus,
  AttackBonusControl,
  AttackPattern,
  AttackPatternConf,
  CalcItem,
  CalcItemCalculator,
  CalcItemRecord,
  CharacterCalc,
  LevelableTalentType,
  ModifierAffectType,
  NORMAL_ATTACKS,
  NormalsConfig,
  ResistanceReductionControl,
  TotalAttributeControl,
  // getNormalsConfig,
} from "@Backend";
import type {
  AttackReaction,
  ElementModCtrl,
  HitEvent,
  EntityModifyEvent,
  SimulationAttackBonus,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";
import type { PartyBonusControl } from "./party-bonus-control";

import { pickProps, removeEmpty } from "@Src/utils";
import { MemberBonusesControl } from "./member-bonuses-control";

export class MemberControl extends MemberBonusesControl {
  readonly info: SimulationMember;
  readonly data: AppCharacter;
  private normalsConfig: NormalsConfig = {};

  constructor(
    member: SimulationMember,
    appChar: AppCharacter,
    appWeapon: AppWeapon,
    partyData: SimulationPartyData,
    partyBonus: PartyBonusControl
  ) {
    const rootTotalAttr = new TotalAttributeControl();

    rootTotalAttr.construct(member, appChar, member.weapon, appWeapon, member.artifacts);

    super({ char: member, appChar, partyData }, rootTotalAttr, partyBonus);

    this.info = member;
    this.data = appChar;
  }

  // ========== MODIFY ==========

  /** return affect: null if cannot find the buff */
  modify = (event: EntityModifyEvent, performerWeapon: AppWeapon): ModifyResult => {
    const { modifier } = event;
    const { inputs = [] } = modifier;

    if (modifier.type === "CHARACTER") {
      // #to-do: check if character can do this event (in case events are imported
      // but the modifier is not granted because of character's level/constellation)
      const buff = this?.data.buffs?.find((buff) => buff.index === modifier.id);

      if (buff) {
        const bonuses = this.getAppliedCharacterBonuses({
          buff,
          description: `${this.data.name} / ${buff.src}`,
          inputs,
          fromSelf: true,
        });

        return {
          affect: buff.affect,
          ...bonuses,
          source: buff.src,
        };
      }
    }
    if (modifier.type === "WEAPON") {
      const buff = performerWeapon.buffs?.find((buff) => buff.index === modifier.id);

      if (buff) {
        const bonuses = this.getApplyWeaponBonuses({
          buff,
          refi: 1,
          description: `${this.data.name} / ${performerWeapon.name}`,
          inputs,
          fromSelf: true,
        });

        return {
          affect: buff.affect,
          ...bonuses,
          source: performerWeapon.name,
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

type ModifyResult = {
  affect: ModifierAffectType | null;
  attrBonuses: AppliedAttributeBonus[];
  attkBonuses: AppliedAttackBonus[];
  source: string;
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

export type TalentEventConfig = {
  damage: number | number[];
  disabled: boolean;
  attPatt: ActualAttackPattern;
  attElmt: "pyro" | "hydro" | "electro" | "cryo" | "geo" | "anemo" | "dendro" | "phys";
  reaction: AttackReaction;
  record: CalcItemRecord;
};
