import { Array_ } from "ron-utils";

import type { TeamBuffCtrl } from "@/types";
import type { CalcSetupCore } from "./CalcSetup/CalcSetupCore";

import { getTeamBuffs, MS_ASCENDANT_BUFF_ID } from "@/services/app-data";
import { createModCtrl } from "../modifier.logic";

export function createTeamBuffCtrls(setup: CalcSetupCore): TeamBuffCtrl[] {
  const { team, artBuffCtrls = [] } = setup;

  // Find available team buff ids

  const teamBuffIds = new Set<number>();

  if (team.moonsignLv >= 2) {
    teamBuffIds.add(MS_ASCENDANT_BUFF_ID);
  }

  for (const { data } of artBuffCtrls) {
    data.teamBuffId && teamBuffIds.add(data.teamBuffId);
  }

  for (const teammate of setup.teammates) {
    const { buffCtrls = [] } = teammate.artifact || {};

    for (const { data } of buffCtrls) {
      data.teamBuffId && teamBuffIds.add(data.teamBuffId);
    }
  }

  // Turn ids into ctrls based on AppTeamBuffs

  return Array_.filterMap(getTeamBuffs(), (buff) => teamBuffIds.has(buff.id), createModCtrl(false));
}
