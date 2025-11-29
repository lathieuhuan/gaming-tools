import type { AppMonster, AttackElement, ElementType, ITarget } from "@/types";

export class Target implements ITarget {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;

  data: AppMonster;

  constructor(info: ITarget, data: AppMonster) {
    this.code = info.code;
    this.level = info.level;
    this.variantType = info.variantType;
    this.inputs = info.inputs;
    this.resistances = info.resistances;
    this.data = data;
  }
}
