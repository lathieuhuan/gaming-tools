import { CountMap } from "ron-utils";

import type {
  AllAttributes,
  AllAttributeStat,
  AmplifyingReaction,
  AppCharacter,
  AttackBonus,
  AttackElement,
  AttributeBonus,
  BonusSpec,
  EffectPerformableConditionSpecs,
  EffectReceiverConditionSpecs,
  Level,
  LevelableTalentType,
  QuickenReaction,
  RawCharacter,
  RawCharacterState,
  TeamMember,
} from "@/types";

import { Team } from "@/logic/calculator";
import { isPassedComparison, isValidInput } from "@/utils/effect.utils";
import { splitLevel } from "@/utils/level.utils";
import { ArtifactGear } from "../ArtifactGear";
import { Weapon } from "../Weapon";
import { AttackBonusControl } from "./AttackBonusControl";
import { AttributeControl } from "./AttributeControl";

export type CharacterCreateOptions = Partial<RawCharacterState> & {
  atfGear?: ArtifactGear;
  tllvBonusCtrl?: Map<string, LevelBonus>;
  attrCtrl?: AttributeControl;
  attkBonusCtrl?: AttackBonusControl;
};

export type CharacterCloneOptions = CharacterCreateOptions & {
  weapon?: Weapon;
};

type CharacterInitCalcOptions = {
  team?: Team;
};

export class Character implements TeamMember {
  readonly isTraveler: boolean;

  private monoRecords: NonNullable<BonusMonoRecord>[] = [];
  private calculated = false;

  get baseReactionDMG() {
    return BASE_REACTION_DAMAGE[this.bareLv] ?? 0;
  }

  private constructor(
    public readonly code: number,
    public readonly level: Level,
    public readonly NAs: number,
    public readonly ES: number,
    public readonly EB: number,
    public readonly cons: number,
    public readonly enhanced: boolean,
    public readonly bareLv: number,
    public readonly ascension: number,
    public readonly data: AppCharacter,
    public weapon: Weapon,
    public atfGear: ArtifactGear,
    public attrCtrl: AttributeControl,
    public tllvBonusCtrl: Map<string, LevelBonus>,
    public attkBonusCtrl: AttackBonusControl,
    public finalAttrs: AllAttributes = new CountMap([], { min: -Infinity }),
  ) {
    this.isTraveler = data.name.slice(-8) === "Traveler";
  }

  // ===== GETTERS =====

  totalExtraTalentLv(talentType: LevelableTalentType): number {
    const requiredConsLv = this.data.talentLvBonus?.[talentType];
    const extraLvByCons = requiredConsLv !== undefined && this.cons >= requiredConsLv ? 3 : 0;
    let totalLvBonus = 0;

    this.tllvBonusCtrl.forEach((bonus) => {
      if (bonus.talent === talentType) {
        totalLvBonus += bonus.value;
      }
    });

    return extraLvByCons + totalLvBonus;
  }

  finalTalentLv(talent: LevelableTalentType) {
    return this[talent] + this.totalExtraTalentLv(talent);
  }

  quickenDamageBonus(reaction: QuickenReaction) {
    const pctBonus = this.attkBonusCtrl.get("pct_", reaction);

    switch (reaction) {
      case "aggravate":
        return Math.round(this.baseReactionDMG * 1.15 * (1 + pctBonus / 100));
      case "spread":
        return Math.round(this.baseReactionDMG * 1.25 * (1 + pctBonus / 100));
      default:
        return 0;
    }
  }

  amplifyingReactionMult(reaction: AmplifyingReaction, attElmt: AttackElement) {
    const pctBonus = this.attkBonusCtrl.get("pct_", reaction);

    switch (reaction) {
      case "melt":
        return (1 + pctBonus / 100) * (attElmt === "pyro" ? 2 : attElmt === "cryo" ? 1.5 : 1);
      case "vaporize":
        return (1 + pctBonus / 100) * (attElmt === "pyro" ? 1.5 : attElmt === "hydro" ? 2 : 1);
      default:
        return 1;
    }
  }

  getAttr(key: AllAttributeStat) {
    if (!this.calculated) {
      console.error("Character has not been calculated!");
    }
    return this.finalAttrs.get(key);
  }

  // ===== CALCULATION =====

  initCalculation(options: CharacterInitCalcOptions = {}) {
    const { team } = options;

    this.tllvBonusCtrl.clear();

    team?.extraTalentLv.forEach((bonus, talentType) => {
      const id = `team/${talentType}`;

      this.tllvBonusCtrl.set(id, {
        id,
        talent: talentType,
        value: bonus,
      });
    });

    this.attkBonusCtrl.clear();
    this.attrCtrl.init(this, team?.resonances);
    this.finalAttrs = new CountMap([], { min: -Infinity });
    this.monoRecords = [];
    this.calculated = false;
    return this;
  }

  finalizeCalculation() {
    this.finalAttrs = this.attrCtrl.finalize();
    this.calculated = true;
    return this;
  }

  // ===== EFFECTS =====

  canPerformEffect(condition?: EffectPerformableConditionSpecs, inputs: number[] = []): boolean {
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

    if (condition.checkAny) {
      const anyInvalid = condition.checkAny.some(
        (condition) => !this.canPerformEffect(condition, inputs),
      );

      if (anyInvalid) {
        return false;
      }
    }

    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }

  canReceiveEffect(condition: EffectReceiverConditionSpecs) {
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
    if (condition.forCharacters && !condition.forCharacters.includes(data.code)) {
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

  private isBonusRecorded(trackId: string, targetId: string) {
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
      const notRecorded = !monoId || !this.isBonusRecorded(monoId, toStat);

      if (notRecorded) {
        this.attrCtrl.addBonus({
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
        !monoId || !this.isBonusRecorded(monoId, `${bonus.toType}/${bonus.toKey}`);

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

  clone(options: CharacterCloneOptions = {}) {
    const {
      weapon = this.weapon,
      level = this.level,
      NAs = this.NAs,
      ES = this.ES,
      EB = this.EB,
      cons = this.cons,
      enhanced = this.enhanced,
      atfGear = this.atfGear,
      attrCtrl = this.attrCtrl,
      attkBonusCtrl = this.attkBonusCtrl,
      tllvBonusCtrl = this.tllvBonusCtrl,
    } = options;

    let { bareLv = this.bareLv, ascension = this.ascension } = this;

    if (level !== this.level) {
      const derived = splitLevel(level);

      bareLv = derived.bareLv;
      ascension = derived.ascension;
    }

    return new Character(
      this.code,
      level,
      NAs,
      ES,
      EB,
      cons,
      enhanced,
      bareLv,
      ascension,
      this.data,
      weapon,
      atfGear,
      attrCtrl,
      tllvBonusCtrl,
      attkBonusCtrl,
    );
  }

  deepClone() {
    return new Character(
      this.code,
      this.level,
      this.NAs,
      this.ES,
      this.EB,
      this.cons,
      this.enhanced,
      this.bareLv,
      this.ascension,
      this.data,
      this.weapon.clone(),
      this.atfGear.deepClone(),
      this.attrCtrl.clone(),
      new Map(this.tllvBonusCtrl),
      this.attkBonusCtrl.clone(),
    );
  }

  // ===== STATIC =====

  static #DEFAULT_LEVEL: Level = "1/20";
  static #DEFAULT_NAs = 0;
  static #DEFAULT_ES = 0;
  static #DEFAULT_EB = 0;
  static #DEFAULT_CONS = 0;
  static #DEFAULT_ENHANCED = false;

  static configure(config: CharacterConfigOptions) {
    this.#DEFAULT_LEVEL = config.defaultLevel ?? this.#DEFAULT_LEVEL;
    this.#DEFAULT_NAs = config.defaultNAs ?? this.#DEFAULT_NAs;
    this.#DEFAULT_ES = config.defaultES ?? this.#DEFAULT_ES;
    this.#DEFAULT_EB = config.defaultEB ?? this.#DEFAULT_EB;
    this.#DEFAULT_CONS = config.defaultCons ?? this.#DEFAULT_CONS;
    this.#DEFAULT_ENHANCED = config.defaultEnhanced ?? this.#DEFAULT_ENHANCED;
  }

  static create(data: AppCharacter, weapon: Weapon, options: CharacterCreateOptions) {
    const {
      level = this.#DEFAULT_LEVEL,
      NAs = this.#DEFAULT_NAs,
      ES = this.#DEFAULT_ES,
      EB = this.#DEFAULT_EB,
      cons = this.#DEFAULT_CONS,
      enhanced = this.#DEFAULT_ENHANCED,
      atfGear = ArtifactGear.create(),
      tllvBonusCtrl = new Map<string, LevelBonus>(),
      attrCtrl = AttributeControl.create(),
      attkBonusCtrl = AttackBonusControl.create(),
    } = options;

    const { bareLv, ascension } = splitLevel(level);

    return new Character(
      data.code,
      level,
      NAs,
      ES,
      EB,
      cons,
      enhanced,
      bareLv,
      ascension,
      data,
      weapon,
      atfGear,
      attrCtrl,
      tllvBonusCtrl,
      attkBonusCtrl,
    );
  }

  static getTalentMult(scale: number, talentLv: number) {
    return scale === 0 ? 1 : (TALENT_LV_MULTIPLIERS[scale]?.[talentLv] ?? 0);
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

type CharacterConfigOptions = {
  defaultLevel?: Level;
  defaultNAs?: number;
  defaultES?: number;
  defaultEB?: number;
  defaultCons?: number;
  defaultEnhanced?: boolean;
};

type BonusMonoRecord = {
  trackId: string;
  targetId: string;
};

type LevelBonus = {
  id: string;
  talent: LevelableTalentType;
  value: number;
};

type ReceivedAttributeBonus = Omit<AttributeBonus, "toStat"> & {
  toStat: AttributeBonus["toStat"] | "OWN_ELMT";
  effectSrc: BonusSpec;
};

type ReceivedAttackBonus = AttackBonus & {
  effectSrc: BonusSpec;
};

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
  100: 1674.809,
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
