import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { notification } from "rond";

import { GenshinUser } from "@/services/enka";
import { useRouter } from "@/systems/router";
import { selectAppReady } from "@Store/ui-slice";
import { useGenshinUser } from "../_hooks/useGenshinUser";
import { SearchParams, SelectedBuild } from "../types";
import { DataImportContext, SelectedBuildContext, SelectedBuildContextState } from "./context";

type DataImportProviderProps = {
  children: ReactNode;
  onSelectBuild?: () => void;
  onQuery?: (user?: GenshinUser) => void;
};

export function DataImportProvider(props: DataImportProviderProps) {
  const router = useRouter<SearchParams>();
  const appReady = useSelector(selectAppReady);
  const [selectedBuild, setSelectedBuild] = useState<SelectedBuild>();

  const queryResult = useGenshinUser(router.searchParams?.uid, {
    enabled: appReady,
  });

  useEffect(() => {
    if (!queryResult.data) {
      setSelectedBuild(undefined);
    }

    props.onQuery?.(queryResult.data);
  }, [queryResult]);

  const handleSelectBuild: SelectedBuildContextState[1] = (data) => {
    setSelectedBuild(data);
    props.onSelectBuild?.();
  };

  return (
    <DataImportContext.Provider value={queryResult}>
      <SelectedBuildContext.Provider value={[selectedBuild, handleSelectBuild]}>
        {props.children}
      </SelectedBuildContext.Provider>
    </DataImportContext.Provider>
  );
}
