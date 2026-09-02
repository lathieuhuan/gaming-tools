import { Array_ } from "ron-utils";

import type { TeamBuffCtrl } from "@/types";
import type { CalcSetup } from "./CalcSetup";

import { $AppData } from "@/services";
import { createModCtrl } from "../modifier.logic";

export function createTeamBuffCtrls(setup: CalcSetup): TeamBuffCtrl[] {
  const { team, artBuffCtrls = [] } = setup;

  // Find available team buff ids

  const teamBuffIds = new Set<number>();

  if (team.moonsignLv >= 2) {
    teamBuffIds.add($AppData.MS_ASCENDANT_BUFF_ID);
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

  // Turn ids into ctrls based on $AppData.teamBuffs

  return Array_.filterMap(
    $AppData.teamBuffs,
    (buff) => teamBuffIds.has(buff.id),
    createModCtrl(false),
  );
}
