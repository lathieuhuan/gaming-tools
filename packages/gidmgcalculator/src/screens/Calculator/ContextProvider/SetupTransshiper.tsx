import { useEffect } from "react";
import { message } from "rond";

import { decodeSetup } from "@/logic/setupCodec";
import { useSearchParams } from "@/systems/router";
import { useSetupImporter } from "@/systems/setup-importer";
import { selectAppReady, useUIStore } from "@Store/ui";

type SearchParams = {
  importCode?: string;
};

export function SetupTransshiper() {
  const appReady = useUIStore(selectAppReady);
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const setupImporter = useSetupImporter();

  useEffect(() => {
    const importCode = searchParams.importCode;

    if (appReady && importCode) {
      const result = decodeSetup(importCode);

      if (result.isOk) {
        setupImporter.import({
          ...result.importInfo,
          source: "URL",
        });
        setSearchParams(null);
      } else {
        message.error(result.error);
      }
    }
  }, [appReady]);

  return null;
}
