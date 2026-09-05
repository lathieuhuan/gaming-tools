export type CharacterResponseData = {
  skillTalents?: {
    name: string;
    type: "NORMAL_ATTACK" | "ELEMENTAL_SKILL" | "ELEMENTAL_BURST";
    description: string;
  }[];
  passiveTalents?: {
    name: string;
    description: string;
    level?: number;
  }[];
  constellations?: {
    name: string;
    description: string;
    level: number;
  }[];
};
