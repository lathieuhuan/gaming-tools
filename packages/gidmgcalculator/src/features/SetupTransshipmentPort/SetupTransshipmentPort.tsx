import { useEffect, useRef } from "react";

import { decodeSetup } from "@Src/components/setup-porter";
import { getSearchParam } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateMessage } from "@Store/calculator-slice";
import { updateSetupImportInfo } from "@Store/ui-slice";

export function SetupTransshipmentPort() {
  const dispatch = useDispatch();
  const importCode = useRef(getSearchParam("importCode"));
  const appReady = useSelector((state) => state.ui.ready);

  useEffect(() => {
    if (appReady) {
      if (importCode.current) {
        try {
          dispatch(
            updateSetupImportInfo({
              importRoute: "URL",
              ...decodeSetup(importCode.current),
            })
          );
          importCode.current = "";
        } catch (error) {
          dispatch(
            updateMessage({
              type: "error",
              content: "An unknown error has occurred. This setup cannot be imported.",
            })
          );
        }
      }
    } else {
      window.history.replaceState(null, "", window.location.origin);
    }
  }, [appReady]);

  return null;
}
