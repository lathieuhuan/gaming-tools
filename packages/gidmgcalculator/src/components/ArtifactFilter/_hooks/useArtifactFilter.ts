import { useMemo, useState } from "react";

import type { AttributeStat, IArtifactBasic } from "@/types";
import type { ArtifactFilterCondition } from "../types";

import { Artifact } from "@/models/base";
import { DEFAULT_ARTIFACT_FILTER } from "../constants";

export function useArtifactFilter<T extends IArtifactBasic = IArtifactBasic>(
  artifacts: T[],
  initialFilter: Partial<ArtifactFilterCondition> = {}
) {
  const [filter, setFilter] = useState<ArtifactFilterCondition>({
    ...DEFAULT_ARTIFACT_FILTER,
    ...initialFilter,
  });

  const filteredArtifacts = useMemo(() => filterArtifacts(artifacts, filter), [artifacts, filter]);

  return {
    filter,
    filteredArtifacts,
    setFilter,
  };
}

export function filterArtifacts<T extends IArtifactBasic = IArtifactBasic>(
  artifacts: T[],
  filterCondition: Partial<ArtifactFilterCondition>
) {
  const {
    stats: statsFilter = DEFAULT_ARTIFACT_FILTER.stats,
    codes = [],
    types = [],
  } = filterCondition;

  const shouldFilterMainstat = statsFilter.main !== "All";
  const noFilterCode = !codes.length;
  const noFilterType = !types.length;

  let result = artifacts.filter((artifact) => {
    return (
      (noFilterCode || codes.includes(artifact.code)) &&
      (noFilterType || types.includes(artifact.type))
    );
  });

  if (shouldFilterMainstat) {
    result = result.filter((item) => item.mainStatType === statsFilter.main);
  }

  const requiredSubstats = statsFilter.subs.filter((s) => s !== "All") as AttributeStat[];

  if (requiredSubstats.length) {
    result = result.filter((item) =>
      requiredSubstats.every((requiredSS) => item.subStats.some((ss) => ss.type === requiredSS))
    );
  }

  if (shouldFilterMainstat || requiredSubstats.length) {
    //
    const getValue = (piece: T, ssType: AttributeStat) => {
      return piece.subStats.find((ss) => ss.type === ssType)?.value || 0;
    };

    result.sort((a, b) => {
      if (shouldFilterMainstat) {
        const mainstatCompare = Artifact.mainStatValueOf(b) - Artifact.mainStatValueOf(a);

        if (mainstatCompare) return mainstatCompare;
      }
      for (const requiredSS of requiredSubstats) {
        const substatCompare = getValue(b, requiredSS) - getValue(a, requiredSS);

        if (substatCompare) return substatCompare;
      }
      return 0;
    });
  }

  return result;
}
