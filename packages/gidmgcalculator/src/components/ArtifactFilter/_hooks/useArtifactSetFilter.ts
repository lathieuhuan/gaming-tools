import { useMemo, useState } from "react";

import type { ArtifactType, RawArtifact } from "@/types";
import type { ArtifactFilterSet } from "../types";

import { $AppArtifact } from "@/services";

type Config = {
  artifactType?: ArtifactType;
};

export function useArtifactSetFilter<T extends RawArtifact = RawArtifact>(
  artifacts: T[],
  selectedCodes: number[],
  config?: Config
) {
  const { artifactType = "flower" } = config || {};

  const initialSets = useMemo(() => {
    const countMap = new Map<number, ArtifactFilterSet>();
    const result: ArtifactFilterSet[] = [];

    for (const { code } of artifacts) {
      const data = $AppArtifact.getSet(code)!;
      const filterSet = countMap.get(code);

      if (filterSet) {
        filterSet.count += 1;
      } //
      else {
        const filterSet: ArtifactFilterSet = {
          code,
          selected: selectedCodes.includes(code),
          icon: data[artifactType].icon,
          data,
          count: 1,
        };

        countMap.set(code, filterSet);
        result.push(filterSet);
      }
    }
    return result;
  }, []);

  const [setOptions, setSetOptions] = useState<ArtifactFilterSet[]>(initialSets);

  const toggleSet = (index: number) => {
    setSetOptions((prev) => {
      const result = [...prev];
      result[index].selected = !result[index].selected;
      return result;
    });
  };

  const clearFilter = () => {
    setSetOptions(setOptions.map((set) => ({ ...set, selected: false })));
  };

  return {
    setOptions,
    toggleSet,
    clearFilter,
  };
}
