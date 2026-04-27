import { BonusCoreSpec } from "@/types/modifier-specs";
import { Team } from "./Team";
import { BonusCalc } from "./BonusCalc";
import { BonusPerformTools } from "@/types/calculation";

export function memberAct(memberCode: number, team: Team) {
  const member = team.getMember(memberCode);

  function performBonus(bonus: BonusCoreSpec, tools: Partial<BonusPerformTools>) {
    return new BonusCalc(member, team, tools).makeBonus(bonus);
  }

  return {
    performBonus,
  };
}
