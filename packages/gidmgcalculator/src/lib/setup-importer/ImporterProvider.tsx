import { ReactNode, useMemo, useState } from "react";

import { SetupImportData } from "@/types";
import { ImporterContext } from "./context";
import { ImportCenter } from "./ImportCenter";

export function ImporterProvider({ children }: { children: ReactNode }) {
  const [importInfo, setImportInfo] = useState<SetupImportData>({});

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
        <ImportCenter {...importInfo} params={importInfo.params} onFinish={handleFinish} />
      )}
    </ImporterContext.Provider>
  );
}
