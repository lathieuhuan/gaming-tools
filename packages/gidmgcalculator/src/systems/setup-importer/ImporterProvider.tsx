import { ReactNode, useMemo, useState } from "react";

import { SetupImportInfo } from "@/types";
import { ImporterContext } from "./contexts/ImporterContext";
import { SetupImportCenter } from "./components/ImportCenter";

export function ImporterProvider({ children }: { children: ReactNode }) {
  const [importInfo, setImportInfo] = useState<SetupImportInfo>({});

  const value = useMemo(() => {
    return {
      importInfo,
      import: setImportInfo,
    };
  }, [importInfo]);

  const handleFinish = () => {
    setImportInfo({});
  };

  return (
    <ImporterContext.Provider value={value}>
      {children}

      {importInfo.params && (
        <SetupImportCenter {...importInfo} params={importInfo.params} onFinish={handleFinish} />
      )}
    </ImporterContext.Provider>
  );
}
