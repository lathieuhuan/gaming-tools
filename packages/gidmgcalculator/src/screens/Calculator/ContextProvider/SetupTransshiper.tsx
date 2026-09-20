import { useEffect } from "react";
import { message } from "rond";

import { useSearchParams } from "@/lib/router";
import { decodeSetup } from "@/logic/setupCodec";
import { importSetup, selectAppReady, useUIStore } from "@Store/ui";

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

    if (result.isOk) {
      importSetup({
        meta: {
          id: Date.now(),
          name: "New setup",
          type: "original",
          source: "URL",
        },
        params: result.setup,
      });
      setSearchParams(null);
    } else {
      message.error(result.error);
    }
  }, [appReady]);

  return null;
}
