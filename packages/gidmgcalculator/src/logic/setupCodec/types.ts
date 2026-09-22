import type { CalcSetup } from "../calculator";

type DecodeSuccessResult = {
  isOk: true;
  setup: CalcSetup;
};

type DecodeFailResult = {
  isOk: false;
  error: string;
};

export type DecodeResult = DecodeSuccessResult | DecodeFailResult;
