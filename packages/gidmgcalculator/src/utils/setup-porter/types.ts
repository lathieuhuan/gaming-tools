import type { SetupImportInfo } from "@/types";

type DecodeSuccessResult = {
  isOk: true;
  importInfo: SetupImportInfo;
};

type DecodeFailResult = {
  isOk: false;
  error: string;
};

export type DecodeResult = DecodeSuccessResult | DecodeFailResult;
