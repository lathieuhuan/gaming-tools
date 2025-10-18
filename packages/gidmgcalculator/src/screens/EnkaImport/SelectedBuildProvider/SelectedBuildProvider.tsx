import { ReactNode, useState } from "react";
import { SelectedBuildContext, SelectedBuildContextState } from "./context";
import { SelectedBuild } from "../types";

type SelectedBuildProviderProps = {
  children: ReactNode;
  onSelectBuild?: () => void;
};

export function SelectedBuildProvider(props: SelectedBuildProviderProps) {
  const [selectedBuild, setSelectedBuild] = useState<SelectedBuild | undefined>(undefined);

  const handleSelectBuild: SelectedBuildContextState[1] = (data) => {
    setSelectedBuild(data);
    props.onSelectBuild?.();
  };

  return (
    <SelectedBuildContext.Provider value={[selectedBuild, handleSelectBuild]}>
      {props.children}
    </SelectedBuildContext.Provider>
  );
}
