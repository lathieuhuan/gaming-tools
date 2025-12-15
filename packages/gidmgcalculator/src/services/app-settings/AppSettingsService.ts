import type { Level } from "@/types";

export type AppSettings = {
  separateCharInfo: boolean;
  keepArtStatsOnSwitch: boolean;
  persistUserData: boolean;
  /** Applied to mobile */
  isTabLayout: boolean;
  askBeforeUnload: boolean;
  charLevel: Level;
  charCons: number;
  charNAs: number;
  charES: number;
  charEB: number;
  wpLevel: Level;
  wpRefi: number;
  artLevel: number;
  targetLevel: number;
};

export class AppSettingsService {
  private DEFAULT_SETTINGS: AppSettings = {
    separateCharInfo: false,
    keepArtStatsOnSwitch: false,
    persistUserData: false,
    isTabLayout: true,
    askBeforeUnload: true,
    charLevel: "1/20",
    charCons: 0,
    charNAs: 1,
    charES: 1,
    charEB: 1,
    wpLevel: "1/20",
    wpRefi: 1,
    artLevel: 0,
    targetLevel: 1,
  };

  get<T extends keyof AppSettings>(key: T): AppSettings[T];
  get(): AppSettings;
  get<T extends keyof AppSettings>(key?: T): AppSettings | AppSettings[T] {
    const savedSettings = localStorage.getItem("settings");
    const settings = savedSettings
      ? {
          ...this.DEFAULT_SETTINGS,
          ...(JSON.parse(savedSettings) as AppSettings),
        }
      : this.DEFAULT_SETTINGS;

    return key ? settings[key] : settings;
  }

  set = (newSettings: AppSettings) => {
    localStorage.setItem("settings", JSON.stringify(newSettings));
  };

  patch = (newSettings: Partial<AppSettings>) => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        ...this.get(),
        ...newSettings,
      })
    );
  };
}
