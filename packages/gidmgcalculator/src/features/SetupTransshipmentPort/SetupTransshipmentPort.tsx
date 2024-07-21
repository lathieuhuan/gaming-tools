import { useEffect, useRef } from "react";
// import { message } from "rond";

// import { decodeSetup } from "@Src/components/setup-porter";
// import { getSearchParam } from "@Src/utils";
// import { useDispatch, useSelector } from "@Store/hooks";
// import { updateSetupImportInfo } from "@Store/ui-slice";

export function SetupTransshipmentPort() {
  // const dispatch = useDispatch();
  // const importCode = useRef(getSearchParam("importCode"));
  // const appReady = useSelector((state) => state.ui.ready);

  useEffect(() => {
    window.history.replaceState(null, "", window.location.origin);
  }, []);

  // useEffect(() => {
  //   if (appReady) {
  //     if (importCode.current) {
  //       try {
  //         dispatch(
  //           updateSetupImportInfo({
  //             importRoute: "URL",
  //             ...decodeSetup(importCode.current),
  //           })
  //         );
  //         importCode.current = "";
  //       } catch (error) {
  //         message.error("An unknown error has occurred. This setup cannot be imported.");
  //       }
  //     }
  //   } else {
  //     window.history.replaceState(null, "", window.location.origin);
  //   }
  // }, [appReady]);

  return null;
}
