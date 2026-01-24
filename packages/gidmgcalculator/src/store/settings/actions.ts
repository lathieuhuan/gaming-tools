import type { AppSettingsState } from "./types";

import { useSettingsStore } from "./settings-store";

export const updateSettings = (newSettings: Partial<AppSettingsState>) => {
  useSettingsStore.setState(newSettings);
};
