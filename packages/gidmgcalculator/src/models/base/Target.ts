import type { AttackElement, ElementType, ITarget } from "@/types";

export class Target implements ITarget {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;

  constructor(info: ITarget) {
    this.code = info.code;
    this.level = info.level;
    this.variantType = info.variantType;
    this.inputs = info.inputs;
    this.resistances = info.resistances;
  }

  static DEFAULT(): ITarget {
    return new Target({
      code: 0,
      level: 1,
      resistances: {
        pyro: 10,
        hydro: 10,
        electro: 10,
        cryo: 10,
        geo: 10,
        anemo: 10,
        dendro: 10,
        phys: 10,
      },
    });
  }
}
