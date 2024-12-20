import { useMemo, useState } from "react";
import type { AppArtifact, ArtifactType } from "@Backend";
import type { CalcArtifact } from "@Src/types";

import { $AppArtifact } from "@Src/services";
import Array_ from "@Src/utils/array-utils";

import { ArtifactSetFilter, type ArtifactSetFilterProps } from "../components/ArtifactSetFilter";

type Config = {
  artifactType?: ArtifactType;
};

export type ArtifactFilterSet = {
  code: number;
  chosen: boolean;
  icon: string;
  data: AppArtifact;
};

export function useArtifactSetFilter(artifacts: CalcArtifact[], chosenCodes: number[], config?: Config) {
  const { artifactType = "flower" } = config || {};

  const initialSets = useMemo(() => {
    const result: ArtifactFilterSet[] = [];

    for (const { code } of artifacts) {
      if (!Array_.findByCode(result, code)) {
        const data = $AppArtifact.getSet(code);

        if (data) {
          result.push({
            code,
            chosen: chosenCodes.includes(code),
            icon: data[artifactType].icon,
            data,
          });
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
