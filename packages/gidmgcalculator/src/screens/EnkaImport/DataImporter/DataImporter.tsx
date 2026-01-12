import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import type { SearchParams, SelectedBuild } from "../types";

import { useSearchParams } from "@/systems/router";
import { selectAppReady } from "@Store/ui-slice";
import { useGenshinUser } from "../_hooks/useGenshinUser";
import { useLayoutState } from "../Layout";
import { DataImportContext, SelectedBuildContext, SelectedBuildContextState } from "./context";

type DataImporterProps = {
  children: ReactNode;
};

export function DataImporter(props: DataImporterProps) {
  const [searchParams] = useSearchParams<SearchParams>();
  const appReady = useSelector(selectAppReady);
  const { goToSection } = useLayoutState();
  
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
