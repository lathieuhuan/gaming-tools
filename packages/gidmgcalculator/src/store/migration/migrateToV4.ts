import { convertToV4 } from "@/mirgration/convertToV4";
import { initialState, UserdbState } from "@Store/userdb-slice";

export const migrateToV4 = (state?: any): UserdbState => {
  if (!state) {
    return initialState;
  }

  try {
    const migrateResult = convertToV4({
      version: 3.1,
      characters: state.userChars,
      weapons: state.userWps,
      artifacts: state.userArts,
      setups: state.userSetups,
    });

    return {
      ...state,
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
