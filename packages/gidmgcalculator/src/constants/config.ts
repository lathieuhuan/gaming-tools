export const MAX_TARGET_LEVEL = 120;
export const MAX_USER_WEAPONS = 200;
export const MAX_USER_ARTIFACTS = 800;
export const MAX_USER_SETUPS = 50;
export const MAX_CALC_SETUPS = 4;
export const DATABASE_DATA_VERSION = 4; // check for store migration when updating this
export const EXPORTED_SETUP_VERSION = "2";
export const MINIMUM_SYSTEM_VERSION = "3.20.3";

export const IS_DEV_ENV = import.meta.env.DEV;

export const SCREEN_PATH = {
  CALCULATOR: "/",
  SETUPS: "/setups",
  ARTIFACTS: "/artifacts",
  WEAPONS: "/weapons",
  CHARACTERS: "/characters",
  ENKA: "/enka",
} as const;

export const GENSHIN_DEV_URL = {
  base: "https://genshin.jmp.blue",
  character: (name: string) => `${GENSHIN_DEV_URL.base}/characters/${name}`,
};

export const BACKEND_URL = {
  base: IS_DEV_ENV ? "http://localhost:3000/api" : "https://gidmgcalculator.vercel.app/api",
  allData() {
    return `${this.base}/meta-data`;
  },
  character: {
    byName: (name: string) => `${BACKEND_URL.base}/character?name=${name}`,
  },
  weapon: {
    byCode: (code: number) => `${BACKEND_URL.base}/weapon?code=${code}`,
  },
};
