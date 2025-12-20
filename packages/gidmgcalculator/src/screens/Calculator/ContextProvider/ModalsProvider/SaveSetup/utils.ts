import type { CalcSetup } from "@/models/calculator";
import type { IDbComplexSetup, IDbSetup } from "@/types";
import type { UserdbState } from "@Store/userdb-slice";
import type { ValidationError } from "./types";

import { MAX_USER_ARTIFACTS, MAX_USER_SETUPS, MAX_USER_WEAPONS } from "@/constants/config";
import Array_ from "@/utils/Array";
import { isDbSetup } from "@/utils/setup";

export function validateTeammates(setup: CalcSetup, existedSetup: IDbSetup | IDbComplexSetup) {
  const errors: ValidationError[] = [];

  if (isDbSetup(existedSetup) && existedSetup.type === "combined") {
    const teamMutated = !Array_.isEqual(setup.teammates, existedSetup.teammates);

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
