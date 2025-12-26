import type { AppMonster, AttackElement, ITarget, ResistReductionKey } from "@/types";

import { Target } from "@/models/base";
import { ATTACK_ELEMENTS } from "@/constants/global";

type ReductionRecord = {
  label: string;
  value: number;
};

type Reductions = Record<
  ResistReductionKey,
  {
    value: number;
    records?: ReductionRecord[];
  }
>;

type CalcTargetOptions = {
  shouldRecord?: boolean;
};

export class CalcTarget extends Target {
  protected reductions = {} as Reductions;
  protected shouldRecord: boolean;

  defReduceMult = 1;
  resistMults: Record<AttackElement, number> = {
    pyro: 1,
    hydro: 1,
    electro: 1,
    cryo: 1,
    geo: 1,
    anemo: 1,
    dendro: 1,
    phys: 1,
  };

  constructor(info: ITarget, data: AppMonster, options: CalcTargetOptions = {}) {
    const { shouldRecord = false } = options;

    super(info, data);
    this.shouldRecord = shouldRecord;
  }

  getReduction(key: ResistReductionKey) {
    return this.reductions[key] || { value: 0 };
  }

  takeReduction(key: ResistReductionKey, value: number, label: string) {
    const reduction = this.getReduction(key);

    reduction.value += value;

    if (this.shouldRecord) {
      reduction.records ||= [];
      reduction.records?.push({ label, value });
    }

    this.reductions[key] = reduction;
  }

  getResistMultEquation(key: AttackElement) {
    const RES = (this.resistances[key] - this.getReduction(key).value) / 100;

    return `${RES < 0 ? `1 - (${RES} / 2)` : RES >= 0.75 ? `1 / (4 * ${RES} + 1)` : `1 - ${RES}`}`;
  }

  finalize() {
    this.defReduceMult = 1 - this.getReduction("def").value / 100;

    for (const key of ATTACK_ELEMENTS) {
      const RES = (this.resistances[key] - this.getReduction(key).value) / 100;

      this.resistMults[key] = RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
    }
  }
}
