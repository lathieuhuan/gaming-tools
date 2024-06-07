import { ArtifactAttribute, ArtifactCalc, AttributeStat, CORE_STAT_TYPES } from "@Backend";
import { Artifact } from "@Src/types";
import { applyPercent } from "@Src/utils";

export type SimulationTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

export const _getArtifactAttribute = (artifacts: Array<Artifact | null>, totalAttr: SimulationTotalAttribute) => {
  const artAttr: ArtifactAttribute = {
    hp: 0,
    atk: 0,
    def: 0,
  };

  for (const artifact of artifacts) {
    if (!artifact) continue;

    const { mainStatType, subStats } = artifact;
    const mainStat = ArtifactCalc.mainStatValueOf(artifact);

    artAttr[mainStatType] = (artAttr[mainStatType] || 0) + mainStat;

    for (const subStat of subStats) {
      artAttr[subStat.type] = (artAttr[subStat.type] || 0) + subStat.value;
    }
  }

  for (const statType of CORE_STAT_TYPES) {
    const percentStatValue = artAttr[`${statType}_`];

    if (percentStatValue) {
      artAttr[statType] += applyPercent(totalAttr[statType].base, percentStatValue);
    }
    delete artAttr[`${statType}_`];
  }

  return artAttr;
};
