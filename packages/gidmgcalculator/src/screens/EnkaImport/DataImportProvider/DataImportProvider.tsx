import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import type { SearchParams, SelectedBuild } from "../types";

import { useSearchParams } from "@/systems/router";
import { selectAppReady } from "@Store/ui-slice";
import { useGenshinUser } from "../_hooks/useGenshinUser";
import { useContainerState } from "../Container";
import { DataImportContext, SelectedBuildContext, SelectedBuildContextState } from "./context";

type DataImportProviderProps = {
  children: ReactNode;
};

export function DataImportProvider(props: DataImportProviderProps) {
  const [searchParams] = useSearchParams<SearchParams>();
  const appReady = useSelector(selectAppReady);
  const { goToSection } = useContainerState();
  
  const [selectedBuild, setSelectedBuild] = useState<SelectedBuild>();

  const queryResult = useGenshinUser(searchParams.uid, {
    enabled: appReady,
  });

  useEffect(() => {
    if (!queryResult.data?.builds.length) {
      setSelectedBuild(undefined);
    }
  }, [queryResult]);

  const handleSelectBuild: SelectedBuildContextState[1] = (data) => {
    setSelectedBuild(data);
    goToSection("DETAIL");
  };

  return (
    <DataImportContext.Provider value={queryResult}>
      <SelectedBuildContext.Provider value={[selectedBuild, handleSelectBuild]}>
        {props.children}
      </SelectedBuildContext.Provider>
    </DataImportContext.Provider>
  );
}
