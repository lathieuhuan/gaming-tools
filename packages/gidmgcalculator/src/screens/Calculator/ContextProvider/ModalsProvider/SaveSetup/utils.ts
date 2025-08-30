import type { CalcSetup, UserComplexSetup, UserSetup } from "@/types";
import type { ValidationError } from "./types";

import { MAX_USER_ARTIFACTS, MAX_USER_SETUPS, MAX_USER_WEAPONS } from "@/constants";
import Array_ from "@/utils/array-utils";
import { UserdbState } from "@Store/userdb-slice";
import Setup_ from "@/utils/setup-utils";

export function validateTeammates(setup: CalcSetup, existedSetup: UserSetup | UserComplexSetup) {
  const errors: ValidationError[] = [];

  if (Setup_.isUserSetup(existedSetup) && existedSetup.type === "combined") {
    const team1 = Array_.truthy(existedSetup.party);
    const team2 = Array_.truthy(setup.party);
    const teamMutated = team1.length !== team2.length || team1.some((t1) => team2.every((t2) => t2.name !== t1.name));

    if (teamMutated) {
      errors.push({
        code: "MUTATED_TEAMMATES",
        message: `Teammates must remain the same for this setup to be updated.`,
      });
    }
  }

  return errors;
}

export function validateFreeItemSlots(userdb: UserdbState) {
  const { userSetups, userWps, userArts } = userdb;
  const errors: ValidationError[] = [];

  if (userSetups.filter((setup) => setup.type !== "complex").length + 1 > MAX_USER_SETUPS) {
    errors.push({
      code: "EXCESSIVE_SETUP",
      message: `Too many saved setups. You need to free up at least 1 setup.`,
    });
  }
  if (userWps.length + 1 > MAX_USER_WEAPONS) {
    errors.push({
      code: "EXCESSIVE_WEAPON",
      message: `Too many saved weapons. You need to free up at least 1 weapon.`,
    });
  }
  if (userArts.length + 5 > MAX_USER_ARTIFACTS) {
    errors.push({
      code: "EXCESSIVE_ARTIFACT",
      message: `Too many saved artifacts. You need to free up at least 5 artifacts.`,
    });
  }

  return errors;
}
