import type { AttributeStat, UserArtifact } from "@Src/types";
import type { ArtifactFilterState } from "./ArtifactFilter.types";
import ArtifactUtils from "@Utils/artifact-utils";

export const filterArtifacts = (artifacts: UserArtifact[], filterCondition: ArtifactFilterState) => {
  const { stats, codes, types } = filterCondition;
  const noFilterCode = !codes.length;
  const noFilterType = !types.length;

  let result = artifacts.filter((artifact) => {
    return (noFilterCode || codes.includes(artifact.code)) && (noFilterType || types.includes(artifact.type));
  });

  const compareMainStat = (a: UserArtifact, b: UserArtifact) => {
    return ArtifactUtils.getMainStatValue(b) - ArtifactUtils.getMainStatValue(a);
  };

  if (stats.main !== "All") {
    result = result.filter((p) => p.mainStatType === stats.main);
    if (stats.subs[0] === "All") {
      result.sort(compareMainStat);
    }
  }

  if (stats.subs[0] !== "All") {
    const requires = stats.subs.filter((s) => s !== "All") as AttributeStat[];

    result = result.filter((p) => requires.every((rq) => p.subStats.map((ss) => ss.type).includes(rq)));

    const getValue = (artifact: UserArtifact, type: AttributeStat) => {
      return artifact.subStats.find((stat) => stat.type === type)?.value || 0;
    };

    result.sort((a, b) => {
      if (stats.main !== "All") {
        const msResult = compareMainStat(a, b);
        if (msResult) return msResult;
      }
      for (const rq of requires) {
        const ssResult = getValue(b, rq) - getValue(a, rq);
        if (ssResult) return ssResult;
      }
      return 0;
    });
  }
  return result;
};
