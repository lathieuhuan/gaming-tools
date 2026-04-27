import type { Team } from "./Team";

import { memberCan } from "./memberCan";
import { memberShow } from "./memberShow";

export function teamOperations(team: Team) {
  //

  return {
    can: (memberCode: number) => memberCan(memberCode, team),
    show: (memberCode: number) => memberShow(memberCode, team),
  };
}

export type TeamOperations = ReturnType<typeof teamOperations>;