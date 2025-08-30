import { useEffect } from "react";
import { message } from "rond";

import { useRouter } from "@Src/systems/router";
import { useSetupImporter } from "@Src/systems/setup-importer";
import { DECODE_ERROR_MSG, decodeSetup } from "@Src/utils/setup-porter";
import { useSelector } from "@Store/hooks";
import { selectIsAppReady } from "@Store/ui-slice";

type SearchParams = {
  importCode?: string;
};

export function SetupTransshiper() {
  const isAppReady = useSelector(selectIsAppReady);
  const router = useRouter<SearchParams>();
  const setupImporter = useSetupImporter();

  useEffect(() => {
    const importCode = router.searchParams?.importCode;

    if (isAppReady && importCode) {
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
  }, [isAppReady]);

  return null;
}
