import { useEffect } from "react";
import { message } from "rond";

import { useRouter } from "@/systems/router";
import { useSetupImporter } from "@/systems/setup-importer";
import { DECODE_ERROR_MSG, decodeSetup } from "@/utils/setup-porter";
import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";

type SearchParams = {
  importCode?: string;
};

export function SetupTransshiper() {
  const appReady = useSelector(selectAppReady);
  const router = useRouter<SearchParams>();
  const setupImporter = useSetupImporter();

  useEffect(() => {
    const importCode = router.searchParams?.importCode;

    if (appReady && importCode) {
      const result = decodeSetup(importCode);

      if (result.isOk) {
        setupImporter.import({
          ...result.importInfo,
          importSource: "URL",
        });
        router.updateSearchParams({ importCode: undefined });
      } else {
        message.error(DECODE_ERROR_MSG[result.error]);
      }
    }
  }, [appReady]);

  return null;
}
