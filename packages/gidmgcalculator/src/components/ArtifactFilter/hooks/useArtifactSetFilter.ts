import { useMemo, useState } from "react";
import type { ArtifactType } from "@Backend";
import type { CalcArtifact } from "@Src/types";

import { $AppArtifact } from "@Src/services";

import {
  ArtifactSetFilter,
  type ArtifactSetFilterProps,
  type ArtifactFilterSet,
} from "../components/ArtifactSetFilter";

type Config = {
  artifactType?: ArtifactType;
};

export function useArtifactSetFilter(artifacts: CalcArtifact[], chosenCodes: number[], config?: Config) {
  const { artifactType = "flower" } = config || {};

  const initialSets = useMemo(() => {
    const countMap = new Map<number, ArtifactFilterSet>();
    const result: ArtifactFilterSet[] = [];

    for (const { code } of artifacts) {
      const filterSet = countMap.get(code);

      if (filterSet) {
        filterSet.count += 1;
      } //
      else {
        const data = $AppArtifact.getSet(code);

        if (data) {
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

  const setFilterProps = {
    title: "Filter by Set",
    setOptions,
    onClickSet: toggleSet,
    onClickClearAll: clearFilter,
  } satisfies ArtifactSetFilterProps;

  return {
    setOptions,
    setFilterProps,
    ArtifactSetFilter,
  };
}
