import type { CalcTeamData } from "@/calculation/CalcTeamData";

import { NORMAL_ATTACKS } from "@/calculation/constants";
import Array_ from "@/utils/Array";
import type { IModifierCtrlBasic } from "@/types";

export const getAttackAlterConfigs = (teamData: CalcTeamData, selfBuffCtrls: IModifierCtrlBasic[]) => {
  const configs: AttackAlterConfigs = {};

  for (const ctrl of selfBuffCtrls) {
    const buff = ctrl.activated
      ? Array_.findByIndex(teamData.activeAppMember.buffs, ctrl.index)
      : undefined;
    const { normalsConfig = [] } = buff || {};

    for (const config of Array_.toArray(normalsConfig)) {
      const { checkInput, forPatt = "ALL", ...rest } = config;

      if (teamData.isApplicableEffect(config, ctrl.inputs ?? [], true)) {
        if (forPatt === "ALL") {
          for (const type of NORMAL_ATTACKS) {
            configs[type] = rest;
          }
        } else {
          configs[forPatt] = rest;
        }
      }
    }
  }

  return configs;
};
