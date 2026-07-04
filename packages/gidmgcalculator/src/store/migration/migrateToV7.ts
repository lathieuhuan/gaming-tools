import { convertToV6 } from "@/migration/convertToV6";
import { initialState, UserdbState } from "@Store/userdbSlice";

export const migrateToV7 = (state?: any): UserdbState => {
  if (!state) {
    return initialState;
  }

  try {
    const migrateResult = convertToV6({
      version: 5,
      characters: state.userChars,
      weapons: state.userWps,
      artifacts: state.userArts,
      setups: state.userSetups,
    });

    const result: UserdbState = {
      ...state,
      chosenChar: -1,
      userChars: migrateResult.characters,
      userWps: migrateResult.weapons,
      userArts: migrateResult.artifacts,
      userSetups: migrateResult.setups,
    };

    return result;
    //
  } catch (error) {
    console.error(error);
    return initialState;
  }
};
