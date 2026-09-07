import { Array_ } from "ron-utils";

import type { ArtifactBuffCtrl, ArtifactDebuffCtrl } from "@/types";
import type { CalcSetupCore } from "./CalcSetupCore";

import {
  createMainArtifactBuffCtrls,
  createMainArtifactDebuffCtrls,
  createRsnModCtrls,
} from "@/logic/modifier.logic";
import { createTeamBuffCtrls } from "../createTeamBuffCtrls";

const atfModCtrlKey = (ctrl: ArtifactBuffCtrl | ArtifactDebuffCtrl) => `${ctrl.code}-${ctrl.id}`;

export function syncArtifactModCtrls(setup: CalcSetupCore) {
  const { sets } = setup.main.atfGear;

  setup.artBuffCtrls = Array_.sync(
    setup.artBuffCtrls,
    createMainArtifactBuffCtrls(sets),
    atfModCtrlKey,
  );
  setup.artDebuffCtrls = Array_.sync(
    setup.artDebuffCtrls,
    createMainArtifactDebuffCtrls(sets),
    atfModCtrlKey,
  );
}

export function syncRsnModCtrls(setup: CalcSetupCore) {
  const rsnModCtrls = createRsnModCtrls(setup.team.elmtCount);

  setup.rsnBuffCtrls = Array_.sync(setup.rsnBuffCtrls, rsnModCtrls.buffCtrls, "element");
  setup.rsnDebuffCtrls = Array_.sync(setup.rsnDebuffCtrls, rsnModCtrls.debuffCtrls, "element");
}

export function syncTeamBuffCtrls(setup: CalcSetupCore) {
  const teamBuffCtrls = createTeamBuffCtrls(setup);
  setup.teamBuffCtrls = Array_.sync(setup.teamBuffCtrls, teamBuffCtrls, (ctrl) => ctrl.data.id);
}
