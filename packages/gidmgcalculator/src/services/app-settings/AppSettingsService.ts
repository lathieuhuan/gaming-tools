import { Level } from "@Src/types";

export type AppSettings = {
  charInfoIsSeparated: boolean;
  doKeepArtStatsOnSwitch: boolean;
  persistingUserData: boolean;
  charLevel: Level;
  charCons: number;
  charNAs: number;
  charES: number;
  charEB: number;
  wpLevel: Level;
  wpRefi: number;
  artLevel: number;
};

export class AppSettingsService {
  private DEFAULT_SETTINGS: AppSettings = {
    charInfoIsSeparated: false,
    doKeepArtStatsOnSwitch: false,
    persistingUserData: false,
    charLevel: "1/20",
    charCons: 0,
    charNAs: 1,
    charES: 1,
    charEB: 1,
    wpLevel: "1/20",
    wpRefi: 1,
    artLevel: 0,
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

  set = (newSettings: Partial<AppSettings>) => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        ...this.get(),
        ...newSettings,
      })
    );
  };
}
