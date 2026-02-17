import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ToursState = {
  characterEnhance: boolean;
};

const initialState: ToursState = {
  characterEnhance: false,
};

export const useToursStore = create<ToursState>()(
  persist(
    immer(() => initialState),
    {
      name: "storage:tours",
    }
  )
);
