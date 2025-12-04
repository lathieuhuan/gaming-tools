import type {
  ArtifactType,
  OptimizerAllArtifactModConfigs,
  OptimizerExtraConfigs,
} from "@Calculation";
import type { AppArtifactsByCode, Artifact, ArtifactModCtrl, CalcArtifacts, Target } from "@/types";

// import { InputProcessor, ResultCalculator, getAttackAlterConfigs } from "@Calculation";
import { ResultCalculator } from "@/calculation/ResultCalculator";
import { getAttackAlterConfigs } from "@/calculation/InputProcessor/utils/getAttackAlterConfigs";
import { InputProcessor } from "@/calculation/InputProcessor/InputProcessor";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { createArtifactDebuffCtrls, createModCtrl, getArtifactSetBonuses } from "./utils";

type CalculationStats = ReturnType<InputProcessor["getCalculationStats"]>;

type OnOutput = (
  artifacts: CalcArtifacts,
  totalAttr: CalculationStats["totalAttr"],
  attkBonusesArchive: CalculationStats["attkBonusesArchive"],
  calculator: ResultCalculator
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

  /** @param callback returns true if this set is accepted, otherwise false */

  private forEachSet = (callback: (set: CalcArtifacts) => boolean) => {
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
    const setBonuses = getArtifactSetBonuses(artifacts);
    const artBuffCtrls: ArtifactModCtrl[] = [];

    for (const setBonus of setBonuses) {
      const { buffs = [] } = this.appArtifacts[setBonus.code] || {};

      for (const buff of buffs) {
        const { bonusLv = 1 } = buff;

        if (buff.affect !== "TEAMMATE" && setBonus.bonusLv >= bonusLv) {
          artBuffCtrls.push({
            code: setBonus.code,
            ...createModCtrl(buff, true),
          });
        }
      }
    }
    return artBuffCtrls;
  };

  handleSet = (set: CalcArtifacts, modConfig: OptimizerAllArtifactModConfigs) => {
    // ARTIFACTS
    this.artifacts = set;

    // ARTIFACT BUFFS
    const artBuffCtrls = this.createArtifactBuffCtrls(set);

    this.artBuffCtrls = artBuffCtrls.map((control) => {
      const config = Array_.findByIndex(modConfig.buffs[control.code], control.index);
      return config ? Object_.assign(control, config) : control;
    });

    // ARTIFACT DEBUFFS
    const artDebuffCtrls = createArtifactDebuffCtrls().map((control) => {
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

    const { totalAttr, attkBonusesArchive } = this.getCalculationStats();

    // Will check for totalAttr here according to OptimizerExtraConfigs
    if (totalAttr.cDmg_ > 1000) {
      return null;
    }

    const attAlterConfigs = getAttackAlterConfigs(this.teamData, this.selfBuffCtrls);
    const resistances = this.getResistances(this.target);

    const calculator = new ResultCalculator(
      this.target.level,
      this.teamData,
      totalAttr,
      attkBonusesArchive,
      attAlterConfigs,
      resistances
    );

    return [totalAttr, attkBonusesArchive, calculator] as const;
  };

  optimize = (modConfig: OptimizerAllArtifactModConfigs, extraConfigs: OptimizerExtraConfigs) => {
    const startTime = Date.now();

    this.forEachSet((set) => {
      const result = this.handleSet(set, modConfig);

      if (result) {
        this.onOutput(set, ...result);
        return true;
      }
      return false;
    });

    this.runTime = Date.now() - startTime;
  };
}
