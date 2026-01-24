import { AppSettingsState } from "@Store/settings";

export type OnSettingChange<TKey extends keyof AppSettingsState = keyof AppSettingsState> = (
  key: TKey,
  value: AppSettingsState[TKey]
) => void;
