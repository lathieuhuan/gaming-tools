import type { DecodeResult } from "./types";

import { DECODE_ERROR_MSG, DIVIDER } from "./config";
import { decodeSetupV3 } from "./decodeSetupV3";
import { decodeSetupV4 } from "./decodeSetupV4";
import { decodeSetupV5 } from "./decodeSetupV5";

type Decoder = {
  version: string;
  fn: (data: any) => DecodeResult;
};

const DECODERS: Decoder[] = [
  { version: "3", fn: decodeSetupV3 },
  { version: "4", fn: decodeSetupV4 },
  { version: "5", fn: decodeSetupV5 },
];

export function decodeSetup(code: string): DecodeResult {
  const version = code.slice(0, code.indexOf(DIVIDER[0]));
  const [V, versionNumber] = version;

  const decoder = DECODERS.find((decoder) => decoder.version === versionNumber);

  if (V !== "V" || decoder === undefined) {
    return {
      isOk: false,
      error: DECODE_ERROR_MSG.OLD_VERSION,
    };
  }

  try {
    return decoder.fn(code);
    //
  } catch (e) {
    console.error(e);

    return {
      isOk: false,
      error: DECODE_ERROR_MSG.UNKNOWN,
    };
  }
}
