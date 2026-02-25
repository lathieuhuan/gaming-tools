import type { AppMonster, AttackElement, ElementType, ITarget, ITargetBasic } from "@/types";
import Object_ from "@/utils/Object";

export class Target implements ITarget {
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

  constructor(info: ITargetBasic, data: AppMonster) {
    this.code = info.code;
    this.level = info.level;
    this.variantType = info.variantType;
    this.inputs = info.inputs;
    this.resistances = info.resistances;
    this.data = data;
  }

  serialize(): ITargetBasic {
    return Object_.optionalAssign<ITargetBasic>(
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
