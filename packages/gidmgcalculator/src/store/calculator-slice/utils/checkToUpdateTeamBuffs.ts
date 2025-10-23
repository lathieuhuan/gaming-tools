import { AppCharactersByName, CalcSetup } from "@/types";
import Array_ from "@/utils/Array";
import Modifier_ from "@/utils/Modifier";

export function checkToUpdateTeamBuffs(setup: CalcSetup, data: AppCharactersByName) {
  const teamBuffCtrls = Modifier_.createTeamBuffCtrls(setup, data);

  setup.teamBuffCtrls = Array_.sync(setup.teamBuffCtrls, teamBuffCtrls, "id");
}
