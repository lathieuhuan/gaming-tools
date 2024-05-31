import type { ArtifactAttribute, TotalAttribute } from "@Src/backend/types";
import type { CalcArtifacts } from "@Src/types";

import { CORE_STAT_TYPES } from "@Src/backend/constants";
import { applyPercent } from "@Src/utils";
import { ArtifactCalc } from "@Src/backend/utils";
import { TotalAttributeControl } from "./total-attribute-control";

export function calcArtifactAtribute(artifacts: CalcArtifacts, totalAttr: TotalAttributeControl): ArtifactAttribute;
export function calcArtifactAtribute(artifacts: CalcArtifacts, totalAttr: TotalAttribute): ArtifactAttribute;
export function calcArtifactAtribute(
  artifacts: CalcArtifacts,
  totalAttr: TotalAttribute | TotalAttributeControl
): ArtifactAttribute {
  const artAttr: ArtifactAttribute = {
    hp: 0,
    atk: 0,
    def: 0,
  };
  const isTotalAttributeControl = totalAttr instanceof TotalAttributeControl;

  for (const artifact of artifacts) {
    if (!artifact) continue;

    const { type, mainStatType, subStats } = artifact;
    const mainDesc = type[0].toUpperCase() + type.slice(1);
    const mainStat = ArtifactCalc.mainStatValueOf(artifact);

    artAttr[mainStatType] = (artAttr[mainStatType] || 0) + mainStat;

    if (isTotalAttributeControl) {
      totalAttr.addStable(mainStatType, mainStat, mainDesc);
    }

    for (const subStat of subStats) {
      artAttr[subStat.type] = (artAttr[subStat.type] || 0) + subStat.value;

      if (isTotalAttributeControl) {
        totalAttr.addStable(subStat.type, subStat.value, "Artifact sub-stat");
      }
    }
  }

  for (const statType of CORE_STAT_TYPES) {
    const percentStatValue = artAttr[`${statType}_`];

    if (percentStatValue) {
      const base = isTotalAttributeControl ? totalAttr.getBase(statType) : totalAttr[`${statType}_base`];

      artAttr[statType] += applyPercent(base, percentStatValue);
    }
    delete artAttr[`${statType}_`];
  }

  return artAttr;
}
