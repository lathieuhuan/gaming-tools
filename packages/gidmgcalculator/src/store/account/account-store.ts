import { $AppCharacter } from "@/services";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createDeepMerge from "@fastify/deepmerge";

import type { AccountState } from "./types";

// TODO: Remove from here after 1/4/2026

const oldPersistKey = "persist:account";

const deepMerge = createDeepMerge({ all: true });

const getPersistState = (): AccountState | undefined => {
  try {
    const oldPersistData = localStorage.getItem(oldPersistKey);
    const parsedData = oldPersistData && JSON.parse(oldPersistData);
    const travelerString: string | undefined = parsedData?.traveler;

    if (!travelerString) {
      throw new Error();
    }

    return {
      traveler: JSON.parse(travelerString),
    };
  } catch (error) {
    return undefined;
  }
};

// till here

const initialState: AccountState = {
  traveler: $AppCharacter.DEFAULT_TRAVELER,
};

export const useAccountStore = create<AccountState>()(
  persist(
    immer(() => initialState),
    {
      name: "account-storage",
      // TODO: Remove after 1/4/2026
      merge: (persisted, current) => {
        const persistState = (persisted || getPersistState()) as AccountState | undefined;

        return deepMerge(current, persistState) as never;
      },
    }
  )
);
