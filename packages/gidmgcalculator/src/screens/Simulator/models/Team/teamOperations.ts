import type { Team } from "./Team";

import { memberAct } from "./memberAct";
import { memberCan } from "./memberCan";
import { memberShow } from "./memberShow";

export function teamOperations(team: Team) {
  return {
    act: (memberCode: number) => memberAct(memberCode, team),
    can: (memberCode: number) => memberCan(memberCode, team),
    show: (memberCode: number) => memberShow(memberCode, team),
  };
}

export type TeamOperations = ReturnType<typeof teamOperations>;