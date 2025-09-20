import { useState } from "react";
import {
  ArtifactStatFilterCondition,
  ArtifactStatFilterOption,
  DEFAULT_ARTIFACT_FILTER,
} from "@/utils/filterArtifacts";

export function useArtifactStatFilter(initialFilter: ArtifactStatFilterCondition) {
  const [filter, setFilter] = useState(initialFilter);

  const hasDuplicates = (() => {
    const record: Record<string, boolean> = {
      [filter.main]: true,
    };

    for (const stat of filter.subs) {
      if (stat !== "All" && record[stat]) {
        return true;
      }
      record[stat] = true;
    }

    return false;
  })();

  const changeMainStat = (newStat: string) => {
    const newFilter: ArtifactStatFilterCondition = {
      main: newStat as ArtifactStatFilterOption,
      subs: filter.subs,
    };

    setFilter(newFilter);
  };

  const changeSubStat = (newStat: string, index: number) => {
    const newSubs = [...filter.subs];
    newSubs[index] = newStat as ArtifactStatFilterOption;

    if (newStat === "All") {
      for (let k = index; k < 4; k++) {
        newSubs[k] = "All";
      }
    }

    const newFilter: ArtifactStatFilterCondition = {
      main: filter.main,
      subs: newSubs,
    };

    setFilter(newFilter);
  };

  const clearFilter = () => {
    setFilter(DEFAULT_ARTIFACT_FILTER.stats);
  };

  return {
    statsFilter: filter,
    hasDuplicates,
    changeMainStat,
    changeSubStat,
    clearFilter,
  };
}
