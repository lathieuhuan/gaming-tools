import { ArtifactCalc, ArtifactType, AttributeStat } from "@Backend";
import type { UserArtifact } from "@Src/types";

export type ArtifactStatFilterOption = "All" | AttributeStat;

export type ArtifactStatFilterCondition = {
  main: ArtifactStatFilterOption;
  subs: ArtifactStatFilterOption[];
};

export type ArtifactFilterCondition = {
  stats: ArtifactStatFilterCondition;
  codes: number[];
  types: ArtifactType[];
};

export const DEFAULT_ARTIFACT_FILTER: ArtifactFilterCondition = {
  stats: {
    main: "All",
    subs: Array(4).fill("All"),
  },
  codes: [],
  types: [],
};

export function filterArtifacts(artifacts: UserArtifact[], filterCondition: Partial<ArtifactFilterCondition>) {
  const { stats = DEFAULT_ARTIFACT_FILTER.stats, codes = [], types = [] } = filterCondition;
  const filterMainstat = stats.main !== "All";
  const noFilterCode = !codes.length;
  const noFilterType = !types.length;

  let result = artifacts.filter((artifact) => {
    return (noFilterCode || codes.includes(artifact.code)) && (noFilterType || types.includes(artifact.type));
  });

  if (filterMainstat) {
    result = result.filter((p) => p.mainStatType === stats.main);
  }

  const requires = stats.subs.filter((s) => s !== "All") as AttributeStat[];

  if (requires.length) {
    result = result.filter((p) => requires.every((rq) => p.subStats.some((ss) => ss.type === rq)));
  }

  if (filterMainstat || requires.length) {
    //
    const getValue = (artifact: UserArtifact, type: AttributeStat) => {
      return artifact.subStats.find((stat) => stat.type === type)?.value || 0;
    };

    result.sort((a, b) => {
      if (filterMainstat) {
        const msResult = ArtifactCalc.mainStatValueOf(b) - ArtifactCalc.mainStatValueOf(a);
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
}
