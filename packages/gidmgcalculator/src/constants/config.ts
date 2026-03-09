export const MAX_TARGET_LEVEL = 120;
export const MAX_USER_WEAPONS = 200;
export const MAX_USER_ARTIFACTS = 800;
export const MAX_USER_SETUPS = 50;
export const MAX_CALC_SETUPS = 4;
export const DOWNLOAD_DATA_VERSION = 5;
export const PERSISTED_DATA_VERSION = 6;
export const LEGACY_EXPORTED_SETUP_VERSION = "2";
export const EXPORTED_SETUP_VERSION = "3";
export const MINIMUM_SYSTEM_VERSION = "3.35.0";

export const IS_DEV_ENV = import.meta.env.DEV;

export const SCREEN_PATH = {
  CALCULATOR: "/",
  SETUPS: "/setups",
  ARTIFACTS: "/artifacts",
  WEAPONS: "/weapons",
  CHARACTERS: "/characters",
  ENKA: "/enka",
  SIMULATOR: "/simulator",
} as const;
