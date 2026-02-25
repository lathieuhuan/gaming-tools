import type { DecodeResult } from "./types";

import { EXPORTED_SETUP_VERSION, LEGACY_EXPORTED_SETUP_VERSION } from "@/constants/config";
import { decodeSetupCurrent } from "./decodeSetupCurrent";
import { decodeSetupPrevious } from "./decodeSetupPrevious";
import { DECODE_ERROR_MSG, DIVIDER } from "./config";

export function decodeSetup(code: string): DecodeResult {
  const version = code.slice(0, code.indexOf(DIVIDER[0]));
  const [V, versionNumber] = version;

  if (
    V !== "V" ||
    (versionNumber !== EXPORTED_SETUP_VERSION && versionNumber !== LEGACY_EXPORTED_SETUP_VERSION)
  ) {
    return {
      isOk: false,
      error: DECODE_ERROR_MSG.OLD_VERSION,
    };
  }

  try {
    return versionNumber === EXPORTED_SETUP_VERSION
      ? decodeSetupCurrent(code)
      : decodeSetupPrevious(code);
    //
  } catch (e) {
    console.error(e);

    return {
      isOk: false,
      error: DECODE_ERROR_MSG.UNKNOWN,
    };
  }
}
