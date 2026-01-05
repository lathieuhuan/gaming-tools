import { Artifact, Weapon } from "@/models/base";
import { initialState, UserdbState } from "@Store/userdb-slice";

export const migrateToV5 = (state?: UserdbState): UserdbState => {
  if (!state) {
    return initialState;
  }

  try {
    const { userWps = [], userArts = [] } = state;

    return {
      ...state,
      userWps: userWps.map((weapon) => Weapon.toBasic(weapon)),
      userArts: userArts.map((artifact) => Artifact.toBasic(artifact)),
    };
  } catch (error) {
    console.error(error);
    return state;
  }
};
