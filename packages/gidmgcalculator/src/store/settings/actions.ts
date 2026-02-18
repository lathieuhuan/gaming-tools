import type { AppSettingsState } from "./types";

import { useSettingsStore } from "./settingsStore";

export const updateSettings = (newSettings: Partial<AppSettingsState>) => {
  useSettingsStore.setState(newSettings);
};
