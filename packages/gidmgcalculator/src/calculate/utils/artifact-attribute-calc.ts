import type { ArtifactAttribute, CalcArtifacts } from "@Src/types";
import { CORE_STAT_TYPES } from "@Src/constants";
import { Artifact_, applyPercent } from "@Src/utils";
import { TotalAttributeCalc } from "./total-attribute-calc";

export class ArtifactAttributeCalc {
  private artAttr: ArtifactAttribute = {
    hp: 0,
    atk: 0,
    def: 0,
  };

  constructor(artifacts: CalcArtifacts, totalAttr: TotalAttributeCalc) {
    for (const artifact of artifacts) {
      if (!artifact) continue;

      const { type, mainStatType, subStats } = artifact;
      const mainDesc = type[0].toUpperCase() + type.slice(1);
      const mainStat = Artifact_.mainStatValueOf(artifact);

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
