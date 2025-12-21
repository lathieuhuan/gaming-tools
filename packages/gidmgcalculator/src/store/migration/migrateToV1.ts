import { UserdbState, initialState } from "@Store/userdb-slice";
import { UserDatabaseV0 } from "./types";

export const migrateToV1 = (state?: UserDatabaseV0): UserdbState => {
  console.log("migrateToV1");
  console.log(state);

  if (state) {
    return {
      ...state,
      // TODO announce about this
      userSetups: [],
    };
  }
  return initialState;
};
