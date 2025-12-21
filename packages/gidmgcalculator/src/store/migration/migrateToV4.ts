import { convertToV4 } from "@/mirgration/logic/convertToV4";
import { initialState, UserdbState } from "@Store/userdb-slice";

export const migrateToV4 = (state?: any): UserdbState => {
  console.log("migrateToV4");
  console.log(state);

  if (!state) {
    return initialState;
  }

  try {
    const migrateResult = convertToV4(state);

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
