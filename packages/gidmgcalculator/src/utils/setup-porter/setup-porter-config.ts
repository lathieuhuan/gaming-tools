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
