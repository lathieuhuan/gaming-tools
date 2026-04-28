import type { BonusSpec } from "@/types/modifier-specs";
import type { Team } from "./Team";

import { BonusCalc } from "./BonusCalc";

export function memberAct(memberCode: number, team: Team) {
  const member = team.getMember(memberCode);

  function performBonus(spec: BonusSpec, inputs: number[] = []) {
    return new BonusCalc(member, team, { inputs }).makeBonus(spec);
  }

  return {
    performBonus,
  };
}
