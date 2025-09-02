import { Traveler } from "@/types";

export type AccountIngame = {
  traveler: Traveler;
  powerups: {
    cannedKnowledge: boolean;
    skirksTraining: boolean;
  };
};

export type AccountState = {
  ingame: AccountIngame;
};
