export type SimCharacter = {
  id: number;
  level: number;
  ascension: number;
  basic: number;
  skill: number;
  ultimate: number;
  talent: number;
  lightcone: SimLightCone;
};

type SimLightCone = {
  id: number;
  level: number;
  ascension: number;
  rank: number;
};
