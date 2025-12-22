import { CustomBuffCtrlCategory } from "@/types";

export const DIVIDER: Record<number | "MC" | "MC_INPUTS", string> = {
  0: "/",
  1: ";",
  2: "-",
  3: ":",
  MC: "+",
  MC_INPUTS: ",",
};

export const CUSTOM_BUFF_CATEGORIES: CustomBuffCtrlCategory[] = [
  "totalAttr",
  "attElmtBonus",
  "attPattBonus",
  "rxnBonus",
];

export const DECODE_ERROR_MSG = {
  MAIN_NOT_FOUND: "The main character data is not found.",
  UNKNOWN: "An unknown error has occurred. This setup cannot be imported.",
  OLD_VERSION: "This version of Setup is not supported.",
};
