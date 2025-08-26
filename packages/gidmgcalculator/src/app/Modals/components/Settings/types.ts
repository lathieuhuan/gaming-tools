import type { AppSettings } from "@Src/services";

type SettingKey<T extends keyof AppSettings> = Extract<keyof AppSettings, T>;

type SettingItemRenderCheck = {
  type: "CHECK";
  key: SettingKey<
    "isCharInfoSeparated" | "doKeepArtStatsOnSwitch" | "isTabLayout" | "askBeforeUnload" | "persistingUserData"
  >;
};
type SettingItemRenderSelect = {
  type: "SELECT";
  key: SettingKey<"charLevel" | "charCons" | "charNAs" | "charES" | "charEB" | "wpLevel" | "wpRefi" | "artLevel">;
  options: (string | number)[];
};
type SettingItemRenderInput = {
  type: "INPUT";
  key: SettingKey<"targetLevel">;
  max?: number;
};

type SettingItemRender = (SettingItemRenderSelect | SettingItemRenderInput | SettingItemRenderCheck) & {
  label: string;
  description?: string[];
  isHidden?: boolean;
};

export type SettingGroupRender = {
  title: string;
  items: SettingItemRender[];
};
