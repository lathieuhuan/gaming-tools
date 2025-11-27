import type { AppCharacter, TeamPropertyCondition } from "@/calculation/types";
import { isPassedComparison } from "./isPassedComparison";

export function isValidPartyProps(
  condition: TeamPropertyCondition | undefined,
  activeAppMember: AppCharacter,
  appTeammates: AppCharacter[],
  moonsignLv: number,
  witchRiteLv: number
) {
  if (condition !== undefined) {
    let input = 0;

    switch (condition.type) {
      // case "MIXED":
      //   input = activeAppMember.nation === "natlan" ? 1 : 0;

      //   appTeammates.forEach((data) => {
      //     input += data.nation === "natlan" || data.vision !== activeAppMember.vision ? 1 : 0;
      //   });
      //   break;
      // Temporary check for moonsign
      case "MOONSIGN":
        input = moonsignLv;
        break;
      case "WITCH_RITE":
        input = witchRiteLv;
        break;
    }
    if (!isPassedComparison(input, condition.value, condition.comparison)) {
      return false;
    }
  }
  return true;
}
