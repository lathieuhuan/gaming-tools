import type {
  AllAttributes,
  AmplifyingReaction,
  AppCharacter,
  AttackBonus,
  AttackElement,
  AttributeBonus,
  BonusPerformTools,
  CharacterBuff,
  CharacterDebuff,
  CharacterStateData,
  EffectPerformableCondition,
  EffectReceiverConditions,
  EntityBonus,
  EntityBonusEffect,
  EntityPenaltyEffect,
  RawCharacter,
  ITeamMember,
  Level,
  QuickenReaction,
  TalentType,
} from "@/types";
import type { Clonable } from "../interfaces";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";
import { TypeCounterKey } from "@/utils/TypeCounter";
import { isPassedComparison } from "../utils/isPassedComparison";

import { ArtifactGear } from "../ArtifactGear";
import { Team } from "../Team";
import { isValidInput } from "../utils/isValidInput";
import { Weapon } from "../Weapon";
import { AllAttributesControl } from "./AllAttributesControl";
import { AttackBonusControl } from "./AttackBonusControl";
import { BonusCalc } from "./BonusCalc";
import { CharacterState } from "./CharacterState";
import { PenaltyCalc } from "./PenaltyCalc";

type BonusMonoRecord = {
  trackId: string;
  targetId: string;
};

export type ReceivedAttributeBonus = Omit<AttributeBonus, "toStat"> & {
  toStat: AttributeBonus["toStat"] | "OWN_ELMT";
  effectSrc: EntityBonus<EntityBonusEffect>;
};

export type ReceivedAttackBonus = AttackBonus & {
  effectSrc: EntityBonus<EntityBonusEffect>;
};

export type CharacterConstructOptions = {
  state?: Partial<CharacterStateData>;
  atfGear?: ArtifactGear;
  // extraTalentLvFromTeam?: TypeCounter<TalentType>;
  allAttrsCtrl?: AllAttributesControl;
  attkBonusCtrl?: AttackBonusControl;
  team?: Team;
};

@FlatGetters("state", ["level", "NAs", "ES", "EB", "cons", "enhanced", "bareLv", "ascension"])
export class Character implements ITeamMember, Clonable<Character> {
  code: number;
  state: CharacterState;

  isTraveler: boolean;

  weapon: Weapon;
  atfGear: ArtifactGear;

  // extraTalentLvFromTeam: TypeCounter<TalentType>;
  allAttrsCtrl: AllAttributesControl;
  attkBonusCtrl: AttackBonusControl;

  team: Team;

  declare level: Level;
  declare NAs: number;
  declare ES: number;
  declare EB: number;
  declare cons: number;
  declare enhanced: boolean;
  declare bareLv: number;
  declare ascension: number;

  get baseRxnDamage() {
    return BASE_REACTION_DAMAGE[this.state.bareLv] ?? 0;
  }

  constructor(
    code: number,
    public data: AppCharacter,
    weapon: Weapon,
    options: CharacterConstructOptions
  ) {
    const {
      atfGear = new ArtifactGear(),
      // extraTalentLvFromTeam = new TypeCounter<TalentType>(),
      allAttrsCtrl = new AllAttributesControl(),
      attkBonusCtrl = new AttackBonusControl(),
      team = new Team(),
    } = options;

    this.code = code;
    this.state = new CharacterState(options.state);
    this.isTraveler = data.name.slice(-8) === "Traveler";

    this.weapon = weapon;
    this.atfGear = atfGear;

    // this.extraTalentLvFromTeam = extraTalentLvFromTeam;
    this.allAttrsCtrl = allAttrsCtrl;
    this.attkBonusCtrl = attkBonusCtrl;
    this.team = team;
  }

  joinTeam(team: Team) {
    this.team = team;
  }

  // ===== GETTERS =====

  getTotalXtraTalentLv(talentType: TalentType): number {
    const requiredConsLv = this.data.talentLvBonus?.[talentType];
    const extraTalentLv = requiredConsLv !== undefined && this.cons >= requiredConsLv ? 3 : 0;

    return this.team.extraTalentLv.get(talentType) + extraTalentLv;
  }

  getFinalTalentLv(talent: TalentType) {
    return talent === "altSprint" ? 1 : this[talent] + this.getTotalXtraTalentLv(talent);
  }

  getQuickenBuffDamage(reaction: QuickenReaction) {
    const pctBonus = this.attkBonusCtrl.get("pct_", [reaction]);

    switch (reaction) {
      case "aggravate":
        return Math.round(this.baseRxnDamage * 1.15 * (1 + pctBonus / 100));
      case "spread":
        return Math.round(this.baseRxnDamage * 1.25 * (1 + pctBonus / 100));
      default:
        return 1;
    }
  }

  getAmplifyingMult(reaction: AmplifyingReaction, attElmt: AttackElement) {
    const pctBonus = this.attkBonusCtrl.get("pct_", [reaction]);

    switch (reaction) {
      case "melt":
        return (1 + pctBonus / 100) * (attElmt === "pyro" ? 2 : attElmt === "cryo" ? 1.5 : 1);
      case "vaporize":
        return (1 + pctBonus / 100) * (attElmt === "pyro" ? 1.5 : attElmt === "hydro" ? 2 : 1);
      default:
        return 1;
    }
  }

  getAttr(key: TypeCounterKey<AllAttributes>) {
    return this.allAttrsCtrl.finals.get(key);
  }

  // ===== CALCULATION =====

  initCalculation() {
    this.allAttrsCtrl.init(this);
    this.attkBonusCtrl = new AttackBonusControl();
    return this;
  }

  // ===== PERFORM EFFECTS =====

  canPerformEffect(condition?: EffectPerformableCondition, inputs: number[] = []) {
    if (!condition) {
      return true;
    }

    const { grantedAt } = condition;

    if (grantedAt) {
      const { value } = typeof grantedAt === "string" ? { value: grantedAt } : grantedAt;
      const [prefix, level] = value;
      const isGranted = (prefix === "A" ? this.ascension : this.cons) >= +level;

      if (!isGranted) {
        return false;
      }
    }

    if (condition.beEnhanced && !this.enhanced) {
      return false;
    }

    if (condition.checkMixed) {
      const mixedCount = this.team.getMixedCount(this.data.vision);

      if (!isPassedComparison(mixedCount, 3, "MIN")) {
        return false;
      }
    }

    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }

  performBonus(config: EntityBonusEffect, tools: Partial<BonusPerformTools>) {
    return new BonusCalc(this, this.team, tools).makeBonus(config);
  }

  performPenalty(config: EntityPenaltyEffect, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).makePenalty(config);
  }

  parseBuffDesc(buff: Pick<CharacterBuff, "description" | "effects">, inputs?: number[]) {
    return new BonusCalc(this, this.team, { inputs }).parseAbilityDesc(buff);
  }

  parseDebuffDesc(debuff: Pick<CharacterDebuff, "description" | "effects">, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).parseAbilityDesc(debuff);
  }

  // ===== RECEIVE BONUSES =====

  canReceiveEffect(condition: EffectReceiverConditions) {
    const { data } = this;

    if (condition.forNation && condition.forNation !== data.nation) {
      return false;
    }
    if (condition.forWeapons && !condition.forWeapons.includes(data.weaponType)) {
      return false;
    }
    if (condition.forElmts && !condition.forElmts.includes(data.vision)) {
      return false;
    }
    if (condition.forName && !data.name.includes(condition.forName)) {
      return false;
    }
    if (condition.forEnergyCap) {
      const { value, comparison } = condition.forEnergyCap;
      if (!isPassedComparison(data.EBcost, value, comparison)) {
        return false;
      }
    }

    const { forEnhance } = condition;

    if (forEnhance) {
      if (forEnhance === "MOONSIGN") {
        if (data.faction !== "moonsign") {
          return false;
        }
      } else if (!this.enhanced || data.enhanceType !== forEnhance) {
        return false;
      }
    }

    return true;
  }

  private monoRecords: NonNullable<BonusMonoRecord>[] = [];

  private isRecordedBonus(trackId: string, targetId: string) {
    const recorded = this.monoRecords.some((savedRecord) => {
      return trackId === savedRecord.trackId && targetId === savedRecord.targetId;
    });

    if (recorded) {
      return true;
    }

    this.monoRecords.push({ trackId, targetId });

    return false;
  }

  receiveAttrBonus(bonus: ReceivedAttributeBonus) {
    if (this.canReceiveEffect(bonus.effectSrc)) {
      const { monoId } = bonus.effectSrc;
      const toStat = bonus.toStat === "OWN_ELMT" ? this.data.vision : bonus.toStat;
      const notRecorded = !monoId || !this.isRecordedBonus(monoId, toStat);

      if (notRecorded) {
        this.allAttrsCtrl.applyBonus({
          ...bonus,
          toStat,
        });

        return true;
      }
    }

    return false;
  }

  receiveAttkBonus(bonus: ReceivedAttackBonus) {
    if (this.canReceiveEffect(bonus.effectSrc)) {
      const { monoId } = bonus.effectSrc;
      const notRecorded =
        !monoId || !this.isRecordedBonus(monoId, `${bonus.toType}/${bonus.toKey}`);

      if (notRecorded) {
        this.attkBonusCtrl.add(bonus);

        return true;
      }
    }

    return false;
  }

  //

  serialize(): RawCharacter {
    return Character.serialize(this);
  }

  clone() {
    return new Character(this.code, this.data, this.weapon, {
      state: this.state,
      atfGear: this.atfGear,
      allAttrsCtrl: this.allAttrsCtrl,
      attkBonusCtrl: this.attkBonusCtrl,
      team: this.team,
    });
  }

  deepClone() {
    return new Character(this.code, this.data, this.weapon.clone(), {
      state: this.state,
      atfGear: this.atfGear.deepClone(),
      allAttrsCtrl: this.allAttrsCtrl.clone(),
      attkBonusCtrl: this.attkBonusCtrl.clone(),
      team: this.team,
    });
  }

  // ===== STATIC =====

  static getTalentMult(scale: number, talentLv: number) {
    return scale ? TALENT_LV_MULTIPLIERS[scale]?.[talentLv] ?? 0 : 1;
  }

  static serialize(character: RawCharacter): RawCharacter {
    return {
      code: character.code,
      level: character.level,
      NAs: character.NAs,
      ES: character.ES,
      EB: character.EB,
      cons: character.cons,
      enhanced: character.enhanced,
    };
  }
}

const BASE_REACTION_DAMAGE: Record<number, number> = {
  1: 17.17,
  20: 80.58,
  40: 207.38,
  50: 323.6,
  60: 492.88,
  70: 765.64,
  80: 1077.44,
  90: 1446.85,
  95: 1561.468,
  100: 1674.8092,
};

const TALENT_LV_MULTIPLIERS: Record<number, number[]> = {
  // some NA, CA, Eula's PA
  1: [
    0, 1, 1.08, 1.16, 1.275, 1.35, 1.45, 1.575, 1.7, 1.8373, 1.9768, 2.1264, 2.3245, 2.5125, 2.7,
    2.906,
  ],
  // percentage
  2: [0, 1, 1.075, 1.15, 1.25, 1.325, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.125, 2.25, 2.375],
  // flat
  3: [0, 1, 1.1, 1.2, 1.325, 1.45, 1.575, 1.725, 1.875, 2.025, 2.2, 2.375, 2.55, 2.75, 2.95, 3.16],
  // NA: Aloy, Razor, Yoimiya; Xiao NA+CA, Hu Tao NAs, raiden's sword attacks
  4: [
    0, 1, 1.068, 1.136, 1.227, 1.295, 1.375, 1.477, 1.579, 1.682, 1.784, 1.886, 1.989, 2.091, 2.193,
    2.295,
  ],
  // hutao E, xiao Q, yanfei Q, yoimiya E, aloy E, wanderer E, wriothesley E
  5: [
    0, 1, 1.06, 1.12, 1.198, 1.258, 1.318, 1.396, 1.474, 1.552, 1.629, 1.708, 1.784, 1.862, 1.94,
    2.018,
  ],
  // zhongli Q
  6: [
    0, 1, 1.108, 1.216, 1.351, 1.473, 1.595, 1.757, 1.919, 2.081, 2.243, 2.405, 2.568, 2.703, 2.838,
    2.973,
  ],
  // major NA, CA, PA
  7: [
    0, 1, 1.081, 1.163, 1.279, 1.361, 1.454, 1.581, 1.709, 1.837, 1.977, 2.116, 2.256, 2.395, 2.535,
    2.675,
  ],
};
