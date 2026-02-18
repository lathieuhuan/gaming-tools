import { convertToV5 } from "@/migration/convertToV5";
import { initialState, UserdbState } from "@Store/userdbSlice";

export const migrateToV6 = (state?: any): UserdbState => {
  if (!state) {
    return initialState;
  }

  try {
    const migrateResult = convertToV5({
      version: 4,
      characters: state.userChars,
      weapons: state.userWps,
      artifacts: state.userArts,
      setups: state.userSetups,
    });

    return {
      ...state,
      chosenChar: -1,
      userChars: migrateResult.characters,
      userWps: migrateResult.weapons,
      userArts: migrateResult.artifacts,
      userSetups: migrateResult.setups,
    };
  } catch (error) {
    console.error(error);
    return initialState;
  }
};
