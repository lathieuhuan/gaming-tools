import { Array_ } from "ron-utils";

import type { CalcSetupCore } from "./CalcSetupCore";

import { createArtifactDebuffCtrls, createRsnModCtrls } from "@/logic/modifier.logic";
import { createTeamBuffCtrls } from "../createTeamBuffCtrls";

export function syncRsnModCtrls(setup: CalcSetupCore) {
  const rsnModCtrls = createRsnModCtrls(setup.team.elmtCount);

  setup.rsnBuffCtrls = Array_.sync(setup.rsnBuffCtrls, rsnModCtrls.buffCtrls, "element");
  setup.rsnDebuffCtrls = Array_.sync(setup.rsnDebuffCtrls, rsnModCtrls.debuffCtrls, "element");
}

export function syncTeamBuffCtrls(setup: CalcSetupCore) {
  const teamBuffCtrls = createTeamBuffCtrls(setup);
  setup.teamBuffCtrls = Array_.sync(setup.teamBuffCtrls, teamBuffCtrls, (ctrl) => ctrl.data.id);
}

export function syncArtifactDebuffCtrls(setup: CalcSetupCore) {
  const artDebuffCtrls = createArtifactDebuffCtrls(setup.main.atfGear.sets, setup.teammates);
  setup.artDebuffCtrls = Array_.sync(setup.artDebuffCtrls, artDebuffCtrls, (ctrl) => ctrl.code);
}
