import { ReactNode, useMemo, useState } from "react";

import { SetupImportInfo } from "@Src/types";
import { ImporterContext } from "../contexts/ImporterContext";
import { SetupImportCenter } from "./ImportCenter";

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

      {importInfo.calcSetup && importInfo.target ? (
        <SetupImportCenter
          {...importInfo}
          calcSetup={importInfo.calcSetup}
          target={importInfo.target}
          onFinish={handleFinish}
        />
      ) : null}
    </ImporterContext.Provider>
  );
}
