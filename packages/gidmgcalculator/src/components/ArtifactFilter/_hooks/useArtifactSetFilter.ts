import { useMemo, useState } from "react";

import type { ArtifactType, IArtifactBasic } from "@/types";
import type { ArtifactFilterSet } from "../types";

import { useArtifactSetData } from "@/hooks";

type Config = {
  artifactType?: ArtifactType;
};

export function useArtifactSetFilter<T extends IArtifactBasic = IArtifactBasic>(
  artifacts: T[],
  chosenCodes: number[],
  config?: Config
) {
  const { artifactType = "flower" } = config || {};
  const setData = useArtifactSetData();

  const initialSets = useMemo(() => {
    const countMap = new Map<number, ArtifactFilterSet>();
    const result: ArtifactFilterSet[] = [];

    for (const { code } of artifacts) {
      const data = setData.get(code);
      const filterSet = countMap.get(code);

      if (filterSet) {
        filterSet.count += 1;
      } //
      else {
        const filterSet: ArtifactFilterSet = {
          code,
          chosen: chosenCodes.includes(code),
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
      result[index].chosen = !result[index].chosen;
      return result;
    });
  };

  const clearFilter = () => {
    setSetOptions(setOptions.map((set) => ({ ...set, chosen: false })));
  };

  return {
    setOptions,
    toggleSet,
    clearFilter,
  };
}
