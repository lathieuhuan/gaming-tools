import { GeneralCalc, InputProcessor, CalcItemCalculator } from "@Backend";
import type { ArtifactType, OptimizerAllArtifactModConfigs, OptimizerExtraConfigs } from "@Backend";
import type { AppArtifactsByCode, Artifact, ArtifactModCtrl, CalcArtifacts, Target } from "@Src/types";

import Array_ from "@Src/utils/array-utils";
import Modifier_ from "@Src/utils/modifier-utils";
import Object_ from "@Src/utils/object-utils";

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
  runTime = 0;

  onReachMilestone = (data: { percent: number; time: number }) => {};

  onOutput: OnOutput = () => {};

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
    const milestoneStep = this.calculationCount > 100000 ? 10 : 20;
    const startTime = Date.now();
    let processedCount = 0;
    let nextMs = milestoneStep;

    for (const flower of this.getArtifacts("flower")) {
      for (const plume of this.getArtifacts("plume")) {
        for (const sands of this.getArtifacts("sands")) {
          for (const goblet of this.getArtifacts("goblet")) {
            for (const circlet of this.getArtifacts("circlet")) {
              const isOk = callback([flower, plume, sands, goblet, circlet]);

              if (isOk) processedCount++;

              if (processedCount / this.calculationCount >= nextMs / 100) {
                this.onReachMilestone({
                  percent: nextMs,
                  time: Date.now() - startTime,
                });
                nextMs += milestoneStep;
              }
            }
          }
        }
      }
    }
  };

  load = (artifacts: ArtifactMap, appArtifacts: AppArtifactsByCode, calculationCount?: number) => {
    calculationCount ||=
      (artifacts.flower.length || 1) *
      (artifacts.plume.length || 1) *
      (artifacts.sands.length || 1) *
      (artifacts.goblet.length || 1) *
      (artifacts.circlet.length || 1);

    this.artifactMap = artifacts;
    this.appArtifacts = appArtifacts;
    this.calculationCount = calculationCount;
    return this;
  };

  private createArtifactBuffCtrls = (artifacts: CalcArtifacts) => {
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
    const artBuffCtrls: ArtifactModCtrl[] = [];

    for (const setBonus of setBonuses) {
      const { buffs = [] } = this.appArtifacts[setBonus.code] || {};

      for (const buff of buffs) {
        const { bonusLv = 1 } = buff;

        if (buff.affect !== "TEAMMATE" && setBonus.bonusLv >= bonusLv) {
          artBuffCtrls.push({
            code: setBonus.code,
            ...Modifier_.createModCtrl(buff, true),
          });
        }
      }
    }
    return artBuffCtrls;
  };

  optimize = (modConfig: OptimizerAllArtifactModConfigs, extraConfigs: OptimizerExtraConfigs) => {
    const startTime = Date.now();

    this.forEachCombination((set) => {
      // ARTIFACTS
      this.artifacts = set;

      // ARTIFACT BUFFS
      const artBuffCtrls = this.createArtifactBuffCtrls(set);

      console.log("=========");
      console.log([...this.artifacts]);
      console.log([...artBuffCtrls]);

      this.artBuffCtrls = artBuffCtrls.map((control) => {
        const config = Array_.findByIndex(modConfig.buffs[control.code], control.index);
        return config ? Object_.assign(control, config) : control;
      });

      // ARTIFACT DEBUFFS
      const artDebuffCtrls = Modifier_.createArtifactDebuffCtrls().map((control) => {
        // Merge control in the setup [this.artDebuffCtrls] & control from config [modConfig.debuffs]
        // into default control.
        // Control from config is prioritized.

        const existControl = this.artDebuffCtrls.find(
          (ctrl) => ctrl.code === control.code && ctrl.index === control.index
        );
        if (existControl) Object_.assign(control, existControl);

        const config = Array_.findByIndex(modConfig.debuffs[control.code], control.index);
        if (config) Object_.assign(control, config);

        return control;
      });

      this.artDebuffCtrls = artDebuffCtrls;

      // console.log(this.artBuffCtrls);
      // console.log(this.artDebuffCtrls);

      const { totalAttr, attkBonusesArchive } = this.getCalculationStats();
      const resistances = this.getResistances(this.target);
      const NAsConfig = this.getNormalAttacksConfig();

      const calculator = new CalcItemCalculator(
        this.target.level,
        this.characterRecord,
        NAsConfig,
        this.customInfusion,
        totalAttr,
        attkBonusesArchive,
        resistances
      );

      this.onOutput(set, totalAttr, attkBonusesArchive, calculator);

      return true;
    });

    this.runTime = Date.now() - startTime;
  };
}
