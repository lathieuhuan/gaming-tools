import type { Artifact, CalcArtifacts, Target } from "@Src/types";
import type { ArtifactType, OptimizerArtifactBuffConfigs } from "../types";

import Array_ from "@Src/utils/array-utils";
import Modifier_ from "@Src/utils/modifier-utils";
import Object_ from "@Src/utils/object-utils";
import Setup_ from "@Src/utils/setup-utils";
import { CalcItemCalculator } from "../calculation-utils/calc-item-calculator";
import { GeneralCalc } from "../common-utils";
import { InputProcessor } from "./input-processor";

type CalculationStats = ReturnType<InputProcessor["getCalculationStats"]>;

type OnOutput = (
  artifacts: CalcArtifacts,
  totalAttr: CalculationStats["totalAttr"],
  attkBonusesArchive: CalculationStats["attkBonusesArchive"],
  calculator: CalcItemCalculator
) => void;

export class SetupOptimizer extends InputProcessor {
  private artifactMap = new Map<ArtifactType, Set<Artifact | null>>();
  private target = Setup_.createTarget();

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

  load = (artifacts: Artifact[], target: Target) => {
    for (const artifact of artifacts) {
      this.artifactMap.set(artifact.type, this.get(artifact.type).add(artifact));
    }
    this.target = target;
    return this;
  };

  onOutput: OnOutput = () => {};

  optimize = (artifactBuffConfigs: OptimizerArtifactBuffConfigs) => {
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
  };
}
