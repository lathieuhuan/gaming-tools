import type { CalcArtifacts } from "@Src/types";
import type { ArtifactAttribute, TotalAttribute } from "@Src/backend/types";
import { TotalAttributeControl } from "./total-attribute-control";

import { CORE_STAT_TYPES } from "@Src/backend/constants";
import { applyPercent } from "@Src/utils";
import { ArtifactCalc } from "../utils";

export class ArtifactAttributeControl {
  private artAttr: ArtifactAttribute = {
    hp: 0,
    atk: 0,
    def: 0,
  };

  constructor(artifacts: CalcArtifacts, totalAttr: TotalAttribute);
  constructor(artifacts: CalcArtifacts, totalAttr: TotalAttributeControl);
  constructor(artifacts: CalcArtifacts, totalAttr: TotalAttribute | TotalAttributeControl) {
    const isTotalAttributeControl = totalAttr instanceof TotalAttributeControl;

    for (const artifact of artifacts) {
      if (!artifact) continue;

      const { type, mainStatType, subStats } = artifact;
      const mainDesc = type[0].toUpperCase() + type.slice(1);
      const mainStat = ArtifactCalc.mainStatValueOf(artifact);

      this.artAttr[mainStatType] = (this.artAttr[mainStatType] || 0) + mainStat;

      if (isTotalAttributeControl) {
        totalAttr.addStable(mainStatType, mainStat, mainDesc);
      }

      for (const subStat of subStats) {
        this.artAttr[subStat.type] = (this.artAttr[subStat.type] || 0) + subStat.value;

        if (isTotalAttributeControl) {
          totalAttr.addStable(subStat.type, subStat.value, "Artifact sub-stat");
        }
      }
    }

    for (const statType of CORE_STAT_TYPES) {
      const percentStatValue = this.artAttr[`${statType}_`];

      if (percentStatValue) {
        const base = isTotalAttributeControl ? totalAttr.getBase(statType) : totalAttr[`${statType}_base`];

        this.artAttr[statType] += applyPercent(base, percentStatValue);
      }
      delete this.artAttr[`${statType}_`];
    }
  }

  getValues() {
    return { ...this.artAttr };
  }
}
