import type { TourStepErrorCode } from "../_types";

export function getErrorByCode(code: TourStepErrorCode) {
  switch (code) {
    case "NOT_FOUND":
      return "The next location is not found.";
    default:
      return "Unknown error has occurred.";
  }
}
