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

type ArtifactMap = Record<ArtifactType, Artifact[]>;

export class SetupOptimizer extends InputProcessor {
  private calculationCount = 0;
  private artifactMap: ArtifactMap = {
    flower: [],
    plume: [],
    sands: [],
    goblet: [],
    circlet: [],
  };

  constructor(private target: Target, ...args: ConstructorParameters<typeof InputProcessor>) {
    super(...args);
  }

  private getArtifacts(type: ArtifactType) {
    const artifacts = this.artifactMap[type];
    return artifacts.length ? artifacts : [null];
  }

  /**
   * @param callback return true if this combination is accepted, otherwise false
   */
  private forEachCombination = (callback: (set: CalcArtifacts) => boolean) => {
    let processedCount = 0;
    let nextMs = 0.2;

    for (const flower of this.getArtifacts("flower")) {
      for (const plume of this.getArtifacts("plume")) {
        for (const sands of this.getArtifacts("sands")) {
          for (const goblet of this.getArtifacts("goblet")) {
            for (const circlet of this.getArtifacts("circlet")) {
              const isOk = callback([flower, plume, sands, goblet, circlet]);

              if (isOk) processedCount++;

              if (processedCount / this.calculationCount >= nextMs) {
                this.onReachMilestone(nextMs);
                nextMs += 0.2;
              }
            }
          }
        }
      }
    }
  };

  load = (artifacts: ArtifactMap, calculationCount?: number) => {
    calculationCount ||=
      (artifacts.flower.length || 1) *
      (artifacts.plume.length || 1) *
      (artifacts.sands.length || 1) *
      (artifacts.goblet.length || 1) *
      (artifacts.circlet.length || 1);

    this.artifactMap = artifacts;
    this.calculationCount = calculationCount;
  };

  onReachMilestone = (percent: number) => {};

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

      return true;
    });

    console.timeEnd("optimize");
  };
}
