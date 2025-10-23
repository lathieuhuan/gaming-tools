import type { TravelerInfo } from "@/types";

export const ARTIFACT_SUBSTAT_TYPES = [
  "hp",
  "hp_",
  "atk",
  "atk_",
  "def",
  "def_",
  "em",
  "er_",
  "cRate_",
  "cDmg_",
] as const;

export const DEFAULT_TRAVELER: TravelerInfo = {
  selection: "LUMINE",
  powerups: {
    cannedKnowledge: false,
    skirksTraining: false,
  },
};
