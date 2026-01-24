import type { Level, TravelerConfig } from "@/types";

export type AppSettingsState = {
  traveler: TravelerConfig;
  persistUserData: boolean;
  /** Mobile only */
  isTabLayout: boolean;
  separateCharInfo: boolean;
  keepArtStatsOnSwitch: boolean;
  askBeforeUnload: boolean;
  charLevel: Level;
  charCons: number;
  charNAs: number;
  charES: number;
  charEB: number;
  charEnhanced: boolean;
  wpLevel: Level;
  wpRefi: number;
  artLevel: number;
  targetLevel: number;
};
