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

  private forEachCombination = (cb: (set: CalcArtifacts) => void) => {
    for (const flower of this.getArtifacts("flower")) {
      for (const plume of this.getArtifacts("plume")) {
        for (const sands of this.getArtifacts("sands")) {
          for (const goblet of this.getArtifacts("goblet")) {
            for (const circlet of this.getArtifacts("circlet")) {
              cb([flower, plume, sands, goblet, circlet]);
            }
          }
        }
      }
    }
  };

  load = (artifacts: ArtifactMap) => {
    this.artifactMap = artifacts;
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
