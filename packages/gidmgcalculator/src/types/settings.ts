export type TravelerKey = "LUMINE" | "AETHER";

export type PowerupKey = "cannedKnowledge" | "skirksTraining";

export type TravelerConfig = {
  selection: TravelerKey;
  powerups: {
    [key in PowerupKey]: boolean;
  };
};
