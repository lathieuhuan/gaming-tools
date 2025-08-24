import { ArtifactType } from "@Calculation";

export type GOODStatKey =
  | "hp"
  | "hp_"
  | "atk"
  | "atk_"
  | "def"
  | "def_"
  | "eleMas"
  | "enerRech_"
  | "heal_"
  | "critRate_"
  | "critDMG_"
  | "physical_dmg_"
  | "anemo_dmg_"
  | "geo_dmg_"
  | "electro_dmg_"
  | "hydro_dmg_"
  | "pyro_dmg_"
  | "cryo_dmg_"
  | "dendro_dmg_";

export type GOODAscendable = {
  level: number;
  ascension: number;
};

export type GOODCharacter = GOODAscendable & {
  key: string;
  constellation: number;
  talent: {
    auto: number;
    skill: number;
    burst: number;
  };
};

export type GOODArtifact = {
  setKey: string;
  slotKey: ArtifactType;
  level: number;
  rarity: number;
  mainStatKey: GOODStatKey;
  substats: GOODSubstat[];
  lock: boolean;
  location: string;
};

type GOODSubstat = {
  key: GOODStatKey;
  value: number;
};

export type GOODWeapon = GOODAscendable & {
  key: string;
  refinement: number;
  lock: boolean;
  location: string;
};
