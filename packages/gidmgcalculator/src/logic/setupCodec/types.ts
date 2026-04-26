import type { SetupImportData } from "@/types";

type DecodeSuccessResult = {
  isOk: true;
  importInfo: SetupImportData;
};

type DecodeFailResult = {
  isOk: false;
  error: string;
};

export type DecodeResult = DecodeSuccessResult | DecodeFailResult;
