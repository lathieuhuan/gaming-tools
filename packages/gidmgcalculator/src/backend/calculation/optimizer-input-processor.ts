import type { Artifact, CalcArtifacts, Target } from "@Src/types";
import type { ArtifactType, OptimizerArtifactBuffConfigs } from "../types";

import Array_ from "@Src/utils/array-utils";
import Modifier_ from "@Src/utils/modifier-utils";
import Object_ from "@Src/utils/object-utils";
import { GeneralCalc } from "../common-utils";
import { InputProcessor } from "./input-processor";

type OnOutput = (
  artifacts: CalcArtifacts,
  totalAttr: ReturnType<InputProcessor["getCalculationStats"]>["totalAttr"],
  attkBonusesArchive: ReturnType<InputProcessor["getCalculationStats"]>["attkBonusesArchive"],
  resistances: ReturnType<InputProcessor["getResistances"]>,
  NAsConfig: ReturnType<InputProcessor["getNormalAttacksConfig"]>
) => void;

export class OptimizerInputProcessor extends InputProcessor {
  private artifactMap = new Map<ArtifactType, Set<Artifact | null>>();

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

  loadInputs = (artifacts: Artifact[], artifactBuffConfigs: OptimizerArtifactBuffConfigs, target: Target) => {
    for (const artifact of artifacts) {
      this.artifactMap.set(artifact.type, this.get(artifact.type).add(artifact));
    }

    return {
      process: (onOutput: OnOutput) => {
        this.forEachCombination((set) => {
          const setBonuses = GeneralCalc.getArtifactSetBonuses(set);
          const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(setBonuses);

          for (const control of artBuffCtrls) {
            const config = Array_.findByIndex(artifactBuffConfigs[control.code], control.index);
            if (config) Object_.assign(control, config);
          }

          this.artifacts = set;
          this.artBuffCtrls = artBuffCtrls;

          const stats = this.getCalculationStats();

          onOutput(
            set,
            stats.totalAttr,
            stats.attkBonusesArchive,
            this.getResistances(target),
            this.getNormalAttacksConfig()
          );
        });
      },
    };
  };
}
