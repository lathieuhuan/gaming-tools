import { useEffect } from "react";
import { message } from "rond";

import { useSearchParams } from "@/systems/router";
import { useSetupImporter } from "@/systems/setup-importer";
import { DECODE_ERROR_MSG, decodeSetup } from "@/utils/setup-porter";
import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";

type SearchParams = {
  importCode?: string;
};

export function SetupTransshiper() {
  const appReady = useSelector(selectAppReady);
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
        setSearchParams({ importCode: undefined }, true);
      } else {
        message.error(DECODE_ERROR_MSG[result.error]);
      }
    }
  }, [appReady]);

  return null;
}
