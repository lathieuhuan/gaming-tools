import type { TourKey } from "@/types";
import { prepEnhanceTour } from "./prepEnhanceTour";

export function prepTour(key: TourKey) {
  switch (key) {
    case "CHAR_ENHANCE":
      prepEnhanceTour();
      break;
    default:
      key satisfies never;
  }
}
