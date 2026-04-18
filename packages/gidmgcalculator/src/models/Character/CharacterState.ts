import { Object_ } from "ron-utils";

import type { CharacterStateData, Level, LevelableTalentType, TalentLevelBonus } from "@/types";
import { Ascendable } from "../Ascendable";

type CharacterStateConfig = {
  defaultLevel?: Level;
  defaultNAs?: number;
  defaultES?: number;
  defaultEB?: number;
  defaultCons?: number;
  defaultEnhanced?: boolean;
};

export type CharacterStateContructOptions = {
  levelBonuses?: TalentLevelBonus[];
};

export class CharacterState extends Ascendable implements CharacterStateData {
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;

  #levelBonuses: TalentLevelBonus[] = [];

  get levelBonuses() {
    return this.#levelBonuses;
  }

  static #DEFAULT_LEVEL: Level = "1/20";
  static #DEFAULT_NAs = 0;
  static #DEFAULT_ES = 0;
  static #DEFAULT_EB = 0;
  static #DEFAULT_CONS = 0;
  static #DEFAULT_ENHANCED = false;

  static configure(config: CharacterStateConfig) {
    this.#DEFAULT_LEVEL = config.defaultLevel ?? this.#DEFAULT_LEVEL;
    this.#DEFAULT_NAs = config.defaultNAs ?? this.#DEFAULT_NAs;
    this.#DEFAULT_ES = config.defaultES ?? this.#DEFAULT_ES;
    this.#DEFAULT_EB = config.defaultEB ?? this.#DEFAULT_EB;
    this.#DEFAULT_CONS = config.defaultCons ?? this.#DEFAULT_CONS;
    this.#DEFAULT_ENHANCED = config.defaultEnhanced ?? this.#DEFAULT_ENHANCED;
  }

  constructor(init: Partial<CharacterStateData> = {}, options: CharacterStateContructOptions = {}) {
    const {
      level = CharacterState.#DEFAULT_LEVEL,
      NAs = CharacterState.#DEFAULT_NAs,
      ES = CharacterState.#DEFAULT_ES,
      EB = CharacterState.#DEFAULT_EB,
      cons = CharacterState.#DEFAULT_CONS,
      enhanced = CharacterState.#DEFAULT_ENHANCED,
    } = init;
    const { levelBonuses = [] } = options;

    super(level);

    this.level = level;
    this.NAs = NAs;
    this.ES = ES;
    this.EB = EB;
    this.cons = cons;
    this.enhanced = enhanced;

    for (const bonus of levelBonuses) {
      this.addLevelBonus(bonus);
    }
  }

  update(changes: Partial<CharacterStateData>) {
    Object_.patch<CharacterStateData>(this, {
      level: changes.level,
      NAs: changes.NAs,
      ES: changes.ES,
      EB: changes.EB,
      cons: changes.cons,
      enhanced: changes.enhanced,
    });

    if (changes.level) {
      const { bareLv, ascension } = Ascendable.splitLevel(changes.level);

      this.bareLv = bareLv;
      this.ascension = ascension;
    }

    return this;
  }

  addLevelBonus(bonus: TalentLevelBonus) {
    const existed = this.#levelBonuses.find((b) => b.id === bonus.id);

    if (existed) {
      return false;
    }

    this.#levelBonuses.push(bonus);

    return true;
  }

  removeLevelBonus(id: string) {
    const index = this.#levelBonuses.findIndex((b) => b.id === id);

    if (index === -1) {
      return false;
    }

    this.#levelBonuses.splice(index, 1);

    return true;
  }

  getLevelBonuses(type: LevelableTalentType) {
    return this.#levelBonuses.filter((bonus) => bonus.toType === type);
  }

  getTotalLevelBonus(type: LevelableTalentType) {
    return this.#levelBonuses.reduce((total, bonus) => {
      return total + (bonus.toType === type ? bonus.value : 0);
    }, 0);
  }
}
