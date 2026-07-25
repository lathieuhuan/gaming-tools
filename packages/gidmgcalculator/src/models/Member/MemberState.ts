import { Object_ } from "ron-utils";

import type { Level } from "@/types";
import { Ascendable } from "@/models/Ascendable";

export type MemberStateData = {
  level: Level;
  enhanced: boolean;
  cons: number;
  NAs: number;
  ES: number;
  EB: number;
};

type MemberStateConfig = {
  defaultLevel?: Level;
  defaultEnhanced?: boolean;
  defaultCons?: number;
  defaultNAs?: number;
  defaultES?: number;
  defaultEB?: number;
};

export class MemberState extends Ascendable implements MemberStateData {
  readonly level: Level;
  readonly enhanced: boolean;
  readonly cons: number;
  readonly NAs: number;
  readonly ES: number;
  readonly EB: number;

  static #DEFAULT_LEVEL: Level = "1/20";
  static #DEFAULT_ENHANCED = false;
  static #DEFAULT_CONS = 0;
  static #DEFAULT_NAs = 1;
  static #DEFAULT_ES = 1;
  static #DEFAULT_EB = 1;

  static configure(config: MemberStateConfig) {
    this.#DEFAULT_LEVEL = config.defaultLevel ?? this.#DEFAULT_LEVEL;
    this.#DEFAULT_ENHANCED = config.defaultEnhanced ?? this.#DEFAULT_ENHANCED;
    this.#DEFAULT_CONS = config.defaultCons ?? this.#DEFAULT_CONS;
    this.#DEFAULT_NAs = config.defaultNAs ?? this.#DEFAULT_NAs;
    this.#DEFAULT_ES = config.defaultES ?? this.#DEFAULT_ES;
    this.#DEFAULT_EB = config.defaultEB ?? this.#DEFAULT_EB;
  }

  constructor(init: Partial<MemberStateData> = {}) {
    const {
      enhanced = MemberState.#DEFAULT_ENHANCED,
      cons = MemberState.#DEFAULT_CONS,
      level = MemberState.#DEFAULT_LEVEL,
      NAs = MemberState.#DEFAULT_NAs,
      ES = MemberState.#DEFAULT_ES,
      EB = MemberState.#DEFAULT_EB,
    } = init;

    super(level);

    this.level = level;
    this.enhanced = enhanced;
    this.cons = cons;
    this.NAs = NAs;
    this.ES = ES;
    this.EB = EB;
  }

  update(changes: Partial<MemberStateData>) {
    const { level } = changes;

    Object_.patch<MemberStateData>(this, {
      level,
      enhanced: changes.enhanced,
      cons: changes.cons,
      NAs: changes.NAs,
      ES: changes.ES,
      EB: changes.EB,
    });

    if (level) {
      const { bareLv, ascension } = Ascendable.splitLevel(level);

      Object_.patch<MemberState>(this, {
        bareLv,
        ascension,
      });
    }

    return this;
  }

  set(key: keyof MemberStateData, value: MemberStateData[keyof MemberStateData]) {
    this.update({ [key]: value });
  }
}
