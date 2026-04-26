import { createContext, useContext } from "react";
import { SetupImportData } from "@/types";

type ImporterContextType = {
  importInfo: SetupImportData;
  import: (importInfo: SetupImportData) => void;
};

export const ImporterContext = createContext<ImporterContextType>({
  importInfo: {},
  import: () => {},
});

export function useSetupImporter() {
  return useContext(ImporterContext);
}
