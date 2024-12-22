import type { Artifact, CalcArtifacts, Target } from "@Src/types";
import type { ArtifactType, OptimizerArtifactBuffConfigs, OptimizerExtraConfigs } from "../types";

import Array_ from "@Src/utils/array-utils";
import Modifier_ from "@Src/utils/modifier-utils";
import Object_ from "@Src/utils/object-utils";
import { GeneralCalc } from "../common-utils";
import { InputProcessor } from "./input-processor";
import { CalcItemCalculator } from "./calc-item-calculator";

type CalculationStats = ReturnType<InputProcessor["getCalculationStats"]>;

type OnOutput = (
  artifacts: CalcArtifacts,
  totalAttr: CalculationStats["totalAttr"],
  attkBonusesArchive: CalculationStats["attkBonusesArchive"],
  calculator: CalcItemCalculator
) => void;

export class SetupOptimizer extends InputProcessor {
  private artifactMap = new Map<ArtifactType, Set<Artifact | null>>();

  constructor(private target: Target, ...args: ConstructorParameters<typeof InputProcessor>) {
    super(...args);
  }

  private get(type: ArtifactType, initial?: (Artifact | null)[]) {
    return this.artifactMap.get(type) || new Set(initial);
  }

  private forEachCombination = (cb: (set: CalcArtifacts) => void) => {
    for (const flower of this.get("flower", [null])) {
      for (const plume of this.get("plume", [null])) {
        for (const sands of this.get("sands", [null])) {
          for (const goblet of this.get("goblet", [null])) {
            for (const circlet of this.get("circlet", [null])) {
              cb([flower, plume, sands, goblet, circlet]);
            }
          }
        }
      }
    }
  };

  /**
   * @returns the total number of possible artifact sets
   */
  load = (artifacts: Artifact[]) => {
    this.artifactMap = new Map();

    for (const artifact of artifacts) {
      this.artifactMap.set(artifact.type, this.get(artifact.type).add(artifact));
    }

    return (
      this.get("flower").size *
      this.get("plume").size *
      this.get("sands").size *
      this.get("goblet").size *
      this.get("circlet").size
    );
  };

  onOutput: OnOutput = () => {};

  optimize = (artifactBuffConfigs: OptimizerArtifactBuffConfigs, extraConfigs: OptimizerExtraConfigs) => {
    console.time("optimize");

    this.forEachCombination((set) => {
      const setBonuses = GeneralCalc.getArtifactSetBonuses(set);
      const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(setBonuses);

      for (const control of artBuffCtrls) {
        const config = Array_.findByIndex(artifactBuffConfigs[control.code], control.index);
        if (config) Object_.assign(control, config);
      }

      this.artifacts = set;
      this.artBuffCtrls = artBuffCtrls;

      const { totalAttr, attkBonusesArchive } = this.getCalculationStats();
      const resistances = this.getResistances(this.target);
      const NAsConfig = this.getNormalAttacksConfig();

      const calculator = new CalcItemCalculator(
        this.target.level,
        this.calcInfo,
        NAsConfig,
        this.customInfusion,
        totalAttr,
        attkBonusesArchive,
        resistances
      );

      this.onOutput(set, totalAttr, attkBonusesArchive, calculator);
    });

    console.timeEnd("optimize");
  };
}
