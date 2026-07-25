import { UserdbState, initialState } from "@Store/userdbSlice";
import { UserDatabaseV0 } from "./types";

export const migrateToV1 = (state?: UserDatabaseV0): UserdbState => {
  if (state) {
    return {
      ...state,
      userSetups: [],
    };
  }
  return initialState;
};
