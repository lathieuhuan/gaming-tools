import { Object_ } from "ron-utils";

import type { Clonable, Serializable } from "@/models/interfaces";
import type {
  AmplifyingReaction,
  AppCharacter,
  AttackElement,
  AttributeStat,
  AutoRsnElmtType,
  CharacterStateData,
  Level,
  LevelableTalentType,
  QuickenReaction,
  RawCharacter
} from "@/types";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";

import { ArtifactGear } from "@/models/ArtifactGear";
import { Weapon } from "@/models/Weapon";
import { AttackBonusControl } from "./AttackBonusControl";
import { AttributeBonusControl } from "./AttributeBonusControl";
import { AttributeControl } from "./AttributeControl";
import { MemberState } from "./MemberState";

export type TalentLevelBonus = {
  id: string;
  value: number;
  toType: LevelableTalentType;
};

type LevelBonusControl = Map<string, TalentLevelBonus>;

export type MemberConstructOptions = {
  state?: Partial<CharacterStateData>;
  atfGear?: ArtifactGear;
  attrsCtrl?: AttributeControl;
  attrBonusCtrl?: AttributeBonusControl;
  attkBonusCtrl?: AttackBonusControl;
  lvBonusCtrl?: LevelBonusControl;
};

type MemberCalculationInitOptions = {
  resonanceElmts?: AutoRsnElmtType[];
  levelBonuses?: TalentLevelBonus[];
};

export type MemberCloneOptions = MemberConstructOptions & {
  weapon?: Weapon;
};

@FlatGetters("state", ["level", "NAs", "ES", "EB", "cons", "enhanced", "bareLv", "ascension"])
export class Member implements Clonable<Member>, Serializable<RawCharacter> {
  code: number;
  state: MemberState;

  isTraveler: boolean;

  weapon: Weapon;
  atfGear: ArtifactGear;

  attrsCtrl: AttributeControl;
  attrBonusCtrl: AttributeBonusControl;
  attkBonusCtrl: AttackBonusControl;
  lvlBonusCtrl: LevelBonusControl;

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
    options: MemberConstructOptions = {}
  ) {
    const {
      atfGear = new ArtifactGear(),
      attrsCtrl = new AttributeControl(),
      lvBonusCtrl = new Map(),
      attrBonusCtrl = new AttributeBonusControl(),
      attkBonusCtrl = new AttackBonusControl(),
    } = options;

    this.code = code;
    this.state = new MemberState(options.state);
    this.isTraveler = data.name.slice(-8) === "Traveler";

    this.weapon = weapon;
    this.atfGear = atfGear;

    this.attrsCtrl = attrsCtrl;
    this.lvlBonusCtrl = lvBonusCtrl;
    this.attrBonusCtrl = attrBonusCtrl;
    this.attkBonusCtrl = attkBonusCtrl;
  }

  // ===== GETTERS =====

  getTotalXtraTalentLv(talentType: LevelableTalentType): number {
    const requiredConsLv = this.data.talentLvBonus?.[talentType];
    const extraLvByCons = requiredConsLv !== undefined && this.cons >= requiredConsLv ? 3 : 0;
    let totalLvBonus = 0;

    this.lvlBonusCtrl.forEach((bonus) => {
      if (bonus.toType === talentType) {
        totalLvBonus += bonus.value;
      }
    });

    return extraLvByCons + totalLvBonus;
  }

  getFinalTalentLv(talent: LevelableTalentType) {
    return this[talent] + this.getTotalXtraTalentLv(talent);
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

  getAttr(key: AttributeStat) {
    return this.attrsCtrl.finals.get(key);
  }

  // ===== CALCULATION =====

  initCalculation(options: MemberCalculationInitOptions = {}) {
    const { resonanceElmts = [], levelBonuses = [] } = options;

    this.attrsCtrl.init(this, resonanceElmts);
    this.lvlBonusCtrl.clear();
    this.attrBonusCtrl = new AttributeBonusControl();
    this.attkBonusCtrl = new AttackBonusControl();

    levelBonuses.forEach((bonus) => {
      this.lvlBonusCtrl.set(bonus.id, bonus);
    });

    return this;
  }

  //

  serialize(): RawCharacter {
    return Member.serialize(this);
  }

  clone(options: MemberCloneOptions = {}) {
    const {
      weapon = this.weapon,
      state = this.state,
      atfGear = this.atfGear,
      attrsCtrl = this.attrsCtrl,
      attrBonusCtrl = this.attrBonusCtrl,
      attkBonusCtrl = this.attkBonusCtrl,
      lvBonusCtrl = this.lvlBonusCtrl,
    } = options;

    return new Member(this.code, this.data, weapon, {
      state,
      atfGear,
      attrsCtrl,
      attrBonusCtrl,
      attkBonusCtrl,
      lvBonusCtrl,
    });
  }

  deepClone() {
    return new Member(this.code, this.data, this.weapon.clone(), {
      state: this.state,
      atfGear: this.atfGear.deepClone(),
      attrsCtrl: this.attrsCtrl.clone(),
      attrBonusCtrl: this.attrBonusCtrl.clone(),
      attkBonusCtrl: this.attkBonusCtrl.clone(),
      lvBonusCtrl: Object_.clone(this.lvlBonusCtrl),
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
