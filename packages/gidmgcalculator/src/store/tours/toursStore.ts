import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { TourKey } from "@/types";

export type ToursState = {
  finishedTours: Partial<Record<TourKey, boolean>>;
};

const initialState: ToursState = {
  finishedTours: {},
};

export const useToursStore = create<ToursState>()(
  persist(
    immer(() => initialState),
    {
      name: "storage:tours",
    }
  )
);

export const isTourFinished = (tourKey: TourKey): boolean => {
  return useToursStore.getState().finishedTours[tourKey] === true;
};
