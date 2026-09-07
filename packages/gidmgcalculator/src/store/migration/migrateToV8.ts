import { convertToV7 } from "@/migration/convertToV7";
import { initialState, UserdbState } from "@Store/userdbSlice";

export const migrateToV8 = (state?: any): UserdbState => {
  if (!state) {
    return initialState;
  }

  try {
    const migrateResult = convertToV7({
      version: 6,
      characters: state.userChars,
      weapons: state.userWps,
      artifacts: state.userArts,
      setups: state.userSetups,
    });

    const result: UserdbState = {
      ...initialState,
      ...state,
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
