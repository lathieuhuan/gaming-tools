import { useEffect } from "react";
import { message } from "rond";

import { useSearchParams } from "@/lib/router";
import { decodeSetup } from "@/logic/setupCodec";
import { selectAppReady, sendToImportCenter, useUIStore } from "@Store/ui";

type SearchParams = {
  importCode?: string;
};

export function SetupTransshiper() {
  const appReady = useUIStore(selectAppReady);
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();

  useEffect(() => {
    const importCode = searchParams.importCode;

    if (!appReady || !importCode) {
      return;
    }

    const result = decodeSetup(importCode);

    if (!result.isOk) {
      message.error(result.error);
      return;
    }

    sendToImportCenter(result.setup, {
      source: "URL",
    });

    setSearchParams(null);
  }, [appReady]);

  return null;
}
