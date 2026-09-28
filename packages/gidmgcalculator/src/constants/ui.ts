export const EMPTY_VALUE = "-";

export const SLOT_NAME = {
  resultDiffCell: "result-diff-cell",
};

export const TRAVELER_SETTINGS_TOUR_SITE_IDS = {
  travelerSelection: "traveler-selection",
  powerupsExpandTrigger: "powerups-expand-trigger",
  powerupsList: "powerups-list",
};

export const CHARACTER_ENHANCE_TOUR_SITE_IDS = {
  mainEnhance: "main-enhance",
  subEnhance: (code: number) => `sub-enhance-${code}`,
  secretRiteBuff: "secret-rite",
};

export const TOUR_STEP_ID = {
  teammateSlot: (code: number) => `teammate-slot-${code}`,
  scrollCalculator: "scroll-calculator",
  teamBonus: "team-bonus",
  overviewPanel: "overview-panel",
  modifiersPanel: "modifiers-panel",
  modifiersTab: "modifier-tabs",
  setupPanel: "setup-panel",
  settingsModal: "settings-modal",
  saveSettings: "save-settings",
};

export enum ECalculatorModifierTab {
  DEBUFFS = "DEBUFFS",
  BUFFS = "BUFFS",
}
