import type { PartiallyRequired } from "rond";
import type { CalcArtifacts } from "@Src/types";
import type { AttributeStat, CoreStat } from "@Src/backend/types";
import type { TotalAttributeControl } from "./total-attribute-control";

import { CORE_STAT_TYPES } from "@Src/backend/constants";
import { applyPercent } from "@Src/utils";
import { ArtifactCalc } from "../utils";

export type ArtifactAttribute = PartiallyRequired<Partial<Record<AttributeStat, number>>, CoreStat>;

export class ArtifactAttributeControl {
  private artAttr: ArtifactAttribute = {
    hp: 0,
    atk: 0,
    def: 0,
  };

  constructor(artifacts: CalcArtifacts, totalAttr: TotalAttributeControl) {
    for (const artifact of artifacts) {
      if (!artifact) continue;

      const { type, mainStatType, subStats } = artifact;
      const mainDesc = type[0].toUpperCase() + type.slice(1);
      const mainStat = ArtifactCalc.mainStatValueOf(artifact);

      this.artAttr[mainStatType] = (this.artAttr[mainStatType] || 0) + mainStat;
      totalAttr.addStable(mainStatType, mainStat, mainDesc);

      for (const subStat of subStats) {
        this.artAttr[subStat.type] = (this.artAttr[subStat.type] || 0) + subStat.value;
        totalAttr.addStable(subStat.type, subStat.value, "Artifact sub-stat");
      }
    }

    for (const statType of CORE_STAT_TYPES) {
      const percentStatValue = this.artAttr[`${statType}_`];

      if (percentStatValue) {
        this.artAttr[statType] += applyPercent(totalAttr.getBase(statType), percentStatValue);
      }
      delete this.artAttr[`${statType}_`];
    }
  }

  getValues() {
    return { ...this.artAttr };
  }
}
