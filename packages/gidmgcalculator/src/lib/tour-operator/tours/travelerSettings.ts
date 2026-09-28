import type { TourStep } from "@/lib/tour-guide";
import { timeoutPromise } from "ron-utils";

import { TOUR_STEP_ID, TRAVELER_SETTINGS_TOUR_SITE_IDS } from "@/constants/ui";
import { waitForElementById } from "@/lib/tour-guide";
import { nextFrame } from "@/utils/window.utils";
import { updateUI } from "@Store/ui";
import { $ } from "../utils";

export const travelerSettingsTourSteps: TourStep[] = [
  {
    id: TRAVELER_SETTINGS_TOUR_SITE_IDS.travelerSelection,
    dialogs: ["Select the Traveler here."],
    siteGutter: [8],
    sitePrep: async () => {
      updateUI({ appModalType: "SETTINGS" });

      const element = await waitForElementById(TOUR_STEP_ID.settingsModal);
      if (!element) return;

      const { promise, resolve } = timeoutPromise<void>(500);

      const handleTransitionEnd = () => {
        element.removeEventListener("transitionend", handleTransitionEnd);
        resolve();
      };

      element.addEventListener("transitionend", handleTransitionEnd);

      await promise;
    },
  },
  {
    id: TRAVELER_SETTINGS_TOUR_SITE_IDS.powerupsExpandTrigger,
    dialogs: ["Tap to expand the Traveler's power-ups. Contain story spoilers."],
    siteGutter: [4, 8],
    lastCheck: async () => {
      const toggle = $(TRAVELER_SETTINGS_TOUR_SITE_IDS.powerupsExpandTrigger).this;

      if (toggle instanceof HTMLElement && toggle.getAttribute("aria-expanded") !== "true") {
        toggle.click();
        await nextFrame();
      }
    },
  },
  {
    id: TRAVELER_SETTINGS_TOUR_SITE_IDS.powerupsList,
    dialogs: ["Toggle power-ups acquired through quests. They grant stat bonuses in calculations."],
    siteGutter: [4, 8],
  },
  {
    id: TOUR_STEP_ID.saveSettings,
    dialogs: ["Don't forget to save your settings."],
    siteGutter: [8],
    placement: "top",
  },
];
