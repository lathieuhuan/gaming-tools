import { Array_, Object_, round } from "ron-utils";

import { ATTACK_ELEMENTS } from "@/constants";
import type {
  AppMonster,
  AttackElement,
  ElementType,
  MonsterInputChanges,
  MonsterInputSpecType,
  RawTarget,
  RawTargetState,
  ResistReductionKey,
  TargetData,
} from "@/types";

type TargetCreateOptions = Partial<Pick<RawTarget, "level">>;

export type TargetResistances = Record<AttackElement, number>;

type ResistanceMultipliers = Record<AttackElement, number>;

type ResistReductionLog = {
  label: string;
  value: number;
};

type ResistReductions = Map<
  ResistReductionKey,
  {
    value: number;
    logs: ResistReductionLog[];
  }
>;

export class Target implements TargetData {
  code: number;

  defReduceMult: number;
  resistMults: ResistanceMultipliers;

  private reductions: ResistReductions = new Map();
  private calculated = false;

  private constructor(
    public data: AppMonster,
    public level: number,
    public resistances: TargetResistances,
    public variantType?: ElementType,
    public inputs?: number[],
  ) {
    this.code = data.code;

    this.defReduceMult = DEFAULT_DEF_REDUCE_MULT;
    this.resistMults = { ...DEFAULT_RESISTANCE_MULTIPLIERS };
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
      },
    );
  }

  /** Only preset target can update level, variant type and inputs */
  update(changes: Partial<Pick<RawTargetState, "level" | "variantType" | "inputs">>) {
    const { level = this.level, variantType = this.variantType, inputs = this.inputs } = changes;

    return new Target(
      this.data,
      level,
      deriveResistances(this.data, variantType, inputs),
      variantType,
      inputs,
    );
  }

  /** Only custom target can update resistances */
  updateResistances(resistances: Partial<TargetResistances>) {
    return new Target(
      this.data,
      this.level,
      Object_.patch(this.resistances, resistances),
      this.variantType,
      this.inputs,
    );
  }

  clone() {
    const { level, resistances, variantType, inputs } = this.serialize();
    return new Target(this.data, level, resistances, variantType, inputs);
  }

  // ===== CALCULATION =====

  initCalculation() {
    this.reductions.clear();
    this.defReduceMult = DEFAULT_DEF_REDUCE_MULT;
    this.resistMults = { ...DEFAULT_RESISTANCE_MULTIPLIERS };
    this.calculated = false;
  }

  resistReduction(key: ResistReductionKey) {
    return this.reductions.get(key) || { value: 0, logs: [] };
  }

  takeResistReduction(key: ResistReductionKey, value: number, label: string) {
    const reduction = this.resistReduction(key);

    reduction.value += value;
    reduction.logs.push({ label, value });

    this.reductions.set(key, reduction);
  }

  getResistMultEquation(key: AttackElement) {
    let RES = (this.resistances[key] - this.resistReduction(key).value) / 100;
    RES = round(RES, 4);

    return `${RES < 0 ? `1 - (${RES} / 2)` : RES >= 0.75 ? `1 / (4 * ${RES} + 1)` : `1 - ${RES}`}`;
  }

  finalizeCalculation() {
    this.defReduceMult = 1 - this.resistReduction("def").value / 100;

    for (const key of ATTACK_ELEMENTS) {
      const RES = (this.resistances[key] - this.resistReduction(key).value) / 100;

      this.resistMults[key] = RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
    }

    this.calculated = true;
  }

  // ===== STATIC =====

  static readonly DEFAULT_INPUT_SPEC_TYPE: MonsterInputSpecType = "CHECK";
  static #DEFAULT_LEVEL = 1;

  static configure(config: { defaultLevel?: number }) {
    this.#DEFAULT_LEVEL = config.defaultLevel ?? this.#DEFAULT_LEVEL;
  }

  static create(data: AppMonster, options: TargetCreateOptions = {}) {
    if (data.code === 0) {
      return this.default(options.level);
    }

    const { level = this.#DEFAULT_LEVEL } = options;
    const { variant } = data;

    const firstVariant = variant?.types?.[0];
    const variantType = typeof firstVariant === "string" ? firstVariant : firstVariant?.value;

    const inputSpecs = data.inputConfigs ? Array_.toArray(data.inputConfigs) : [];
    const inputs = inputSpecs.map<number>(
      ({ type = this.DEFAULT_INPUT_SPEC_TYPE }) => DEFAULT_INPUTS[type],
    );

    const resistances = deriveResistances(data, variantType, inputs);

    return new Target(data, level, resistances, variantType, inputs.length ? inputs : undefined);
  }

  static default(level = this.#DEFAULT_LEVEL) {
    return new Target(DEFAULT_MONSTER, level, { ...DEFAULT_RESISTANCES });
  }

  static fromRaw(raw: RawTarget, data: AppMonster) {
    const { level, resistances, variantType, inputs } = raw;

    if (raw.code !== data.code) {
      console.error(`Target code mismatch between raw (${raw.code}) and data (${data.code})`);
    }

    return new Target(data, level, resistances, variantType, inputs);
  }
}

function deriveResistances(data: AppMonster, variantType?: ElementType, inputs: number[] = []) {
  const { variant } = data;
  const inputSpecs = data.inputConfigs ? Array_.toArray(data.inputConfigs) : [];

  const resistances: TargetResistances = {
    pyro: 0,
    hydro: 0,
    electro: 0,
    cryo: 0,
    geo: 0,
    anemo: 0,
    dendro: 0,
    phys: 0,
  };

  for (const atkElmt of ATTACK_ELEMENTS) {
    resistances[atkElmt] = data.resistance[atkElmt] ?? data.resistance.base;
  }

  if (variantType && variant?.change) {
    resistances[variantType] += variant.change;
  }

  const updateAsChanges = (changes: MonsterInputChanges) => {
    for (const [key, value = 0] of Object_.entries(changes)) {
      switch (key) {
        case "base":
          for (const attElmt of ATTACK_ELEMENTS) {
            resistances[attElmt] += value;
          }
          break;
        case "variant":
          if (variantType) {
            resistances[variantType] += value;
          }
          break;
        default:
          resistances[key] += value;
      }
    }
  };

  for (let index = 0; index < inputs.length; index++) {
    const spec = inputSpecs[index];
    if (!spec) continue;

    const input = inputs[index];
    const { type = "CHECK" } = spec;

    switch (type) {
      case "CHECK":
        if (input !== DEFAULT_INPUTS.CHECK && spec.changes) {
          updateAsChanges(spec.changes);
        }
        break;
      case "SELECT": {
        if (input === DEFAULT_INPUTS.SELECT || !spec.options) {
          continue;
        }

        const option = spec.options[input];

        if (typeof option === "string") {
          if (spec.optionChange) {
            resistances[option] += spec.optionChange;
          }
        } else {
          updateAsChanges(option.changes);
        }
        break;
      }
    }
  }

  return resistances;
}

const DEFAULT_MONSTER: AppMonster = {
  code: 0,
  title: "Custom Target",
  resistance: { base: 10 },
};

const DEFAULT_RESISTANCES: TargetResistances = {
  pyro: 10,
  hydro: 10,
  electro: 10,
  cryo: 10,
  geo: 10,
  anemo: 10,
  dendro: 10,
  phys: 10,
};

const DEFAULT_INPUTS: Record<MonsterInputSpecType, number> = {
  CHECK: 0,
  SELECT: -1,
};

const DEFAULT_DEF_REDUCE_MULT = 1;

const DEFAULT_RESISTANCE_MULTIPLIERS: ResistanceMultipliers = {
  pyro: 1,
  hydro: 1,
  electro: 1,
  cryo: 1,
  geo: 1,
  anemo: 1,
  dendro: 1,
  phys: 1,
};
