import { $AppCharacter } from "@/services";
import { TravelerConfig } from "@/types";
import { useAccountStore } from "./account-store";

export const updateTraveler = (newConfig: Partial<TravelerConfig>) => {
  useAccountStore.setState((state) => {
    const newTraveler = {
      ...state.traveler,
      ...newConfig,
    };

    $AppCharacter.changeTraveler(newTraveler);

    return { traveler: newTraveler };
  });
};
