import { initialState, UserdbState } from "@Store/userdbSlice";

export const migrateToV4 = (): UserdbState => {
  // No longer support older version
  return initialState;
};
