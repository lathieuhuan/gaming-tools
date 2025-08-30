import { CustomBuffCtrlCategory } from "@/types";

export const DIVIDER: Record<number | "MC" | "MC_INPUTS", string> = {
  0: "*",
  1: "D1",
  2: "D2",
  3: "D3",
  4: "D4",
  MC: "D8",
  MC_INPUTS: "D9",
};

export const CUSTOM_BUFF_CATEGORIES: CustomBuffCtrlCategory[] = [
  "totalAttr",
  "attElmtBonus",
  "attPattBonus",
  "rxnBonus",
];
