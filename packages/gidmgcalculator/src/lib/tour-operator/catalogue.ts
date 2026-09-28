import type { TourKey } from "@/types";

type Tour = {
  key: TourKey;
  title: string;
  description: string;
};

export const CHARACTER_ENHANCE_TOUR: Tour = {
  key: "CHARACTER_ENHANCE",
  title: "Character Enhance",
  description: "How to toggle the characters' enhanced state.",
};

export const TRAVELER_SETTINGS_TOUR: Tour = {
  key: "TRAVELER_SETTINGS",
  title: "Traveler Settings",
  description: "How to select the Traveler and activate their power-ups.",
};
