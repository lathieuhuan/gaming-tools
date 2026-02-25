import { TourKey } from "@/types";
import { useToursStore } from "./toursStore";

export const setTourFinished = (tourKey: TourKey, finished?: boolean) => {
  useToursStore.setState((state) => {
    state.finishedTours[tourKey] = finished ?? !state.finishedTours[tourKey];
  });
};
