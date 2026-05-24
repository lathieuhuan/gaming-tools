import { Object_ } from "ron-utils";

import type { AppMonster, AttackElement, ElementType, TargetData, RawTarget } from "@/types";

export class Target implements TargetData {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;

  data: AppMonster;

  static DEFAULT_MONSTER: AppMonster = {
    code: 0,
    title: "Custom Target",
    resistance: { base: 10 },
  };

  constructor(info: RawTarget, data: AppMonster) {
    this.code = info.code;
    this.level = info.level;
    this.variantType = info.variantType;
    this.inputs = info.inputs;
    this.resistances = info.resistances;
    this.data = data;
  }

  serialize(): RawTarget {
    return Object_.patch<RawTarget>(
      {
        code: this.code,
        level: this.level,
        resistances: { ...this.resistances },
      },
      {
        variantType: this.variantType,
        inputs: this.inputs?.length ? [...this.inputs] : undefined,
      }
    );
  }
}
