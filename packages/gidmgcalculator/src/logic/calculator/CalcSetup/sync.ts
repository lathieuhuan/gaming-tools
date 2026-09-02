import { Array_ } from "ron-utils";

import type { CalcSetup } from "./CalcSetup";

import { createArtifactDebuffCtrls, createRsnModCtrls } from "@/logic/modifier.logic";
import { createTeamBuffCtrls } from "../createTeamBuffCtrls";

export function syncRsnModCtrls(setup: CalcSetup) {
  const rsnModCtrls = createRsnModCtrls(setup.team.elmtCount);

  setup.rsnBuffCtrls = Array_.sync(setup.rsnBuffCtrls, rsnModCtrls.buffCtrls, "element");
  setup.rsnDebuffCtrls = Array_.sync(setup.rsnDebuffCtrls, rsnModCtrls.debuffCtrls, "element");
}

export function syncTeamBuffCtrls(setup: CalcSetup) {
  const teamBuffCtrls = createTeamBuffCtrls(setup);
  setup.teamBuffCtrls = Array_.sync(setup.teamBuffCtrls, teamBuffCtrls, (ctrl) => ctrl.data.id);
}

export function syncArtifactDebuffCtrls(setup: CalcSetup) {
  const artDebuffCtrls = createArtifactDebuffCtrls(setup.main.atfGear.sets, setup.teammates);
  setup.artDebuffCtrls = Array_.sync(setup.artDebuffCtrls, artDebuffCtrls, (ctrl) => ctrl.code);
}
