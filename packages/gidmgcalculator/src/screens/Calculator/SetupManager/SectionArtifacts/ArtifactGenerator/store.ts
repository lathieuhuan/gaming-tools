import { AttributeStat } from "@/types/common";
import { ANY_ARRAY } from "ron-utils";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type GeneratorState = {
  mainStatTypes: {
    sands: AttributeStat[];
    goblet: AttributeStat[];
    circlet: AttributeStat[];
  };
};

const initialState: GeneratorState = {
  mainStatTypes: {
    sands: ANY_ARRAY,
    goblet: ANY_ARRAY,
    circlet: ANY_ARRAY,
  },
};

export const useGeneratorStore = create<GeneratorState>()(immer(() => initialState));
