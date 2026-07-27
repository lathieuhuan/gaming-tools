import { TourKey } from "@/types";

export type Tour = {
  title: string;
  description: string;
  key: TourKey;
};

export const CHAR_ENHANCE_TOUR: Tour = {
  key: "CHAR_ENHANCE",
  title: "Character Enhance",
  description: "How to toggle the characters' enhanced state.",
};

export const TOURS = [CHAR_ENHANCE_TOUR];
