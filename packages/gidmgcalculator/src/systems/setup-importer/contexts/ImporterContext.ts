import { createContext, useContext } from "react";
import { SetupImportInfo } from "@/types";

type ImporterContextType = {
  importInfo: SetupImportInfo;
  import: (importInfo: SetupImportInfo) => void;
};

export const ImporterContext = createContext<ImporterContextType>({
  importInfo: {},
  import: () => {},
});

export function useSetupImporter() {
  return useContext(ImporterContext);
}
