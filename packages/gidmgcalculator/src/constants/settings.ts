import type { ElementType, TravelerConfig } from "@/types";

export const DEFAULT_TRAVELER: TravelerConfig = {
  selection: "LUMINE",
  powerups: {
    cannedKnowledge: false,
    skirksTraining: false,
  },
  resonatedElmts: [],
};

export const TRAVELER_RESONATED_ELEMENTS: ElementType[] = [
  "anemo",
  "geo",
  "electro",
  "dendro",
  "hydro",
  "pyro",
  "cryo",
];
