export const MAX_TARGET_LEVEL = 120;
export const MAX_USER_WEAPONS = 200;
export const MAX_USER_ARTIFACTS = 800;
export const MAX_USER_SETUPS = 50;
export const MAX_CALC_SETUPS = 4;

export const DOWNLOAD_DATA_VERSION = 7;
export const PERSISTED_DATA_VERSION = 8;
export const EXPORTED_SETUP_VERSIONS = ["3", "4", "5"];
export const MINIMUM_SYSTEM_VERSION = "3.60.0";

export const IS_DEV_ENV = import.meta.env.DEV;

export const SCREEN_PATH = {
  CALCULATOR: "/",
  SETUPS: "/setups",
  ARTIFACTS: "/artifacts",
  WEAPONS: "/weapons",
  CHARACTERS: "/characters",
  ENKA: "/enka",
} as const;
