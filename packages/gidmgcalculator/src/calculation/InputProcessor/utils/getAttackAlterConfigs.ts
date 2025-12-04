import type { CalcTeamData } from "@/calculation/CalcTeamData";
import type { AttackAlterConfig, AttackPattern } from "@/calculation/types";
import type { ModifierCtrl } from "@/types";

import { NORMAL_ATTACKS } from "@/calculation/constants";
import Array_ from "@/utils/Array";

export const getAttackAlterConfigs = (teamData: CalcTeamData, selfBuffCtrls: ModifierCtrl[]) => {
  const configs: Partial<Record<AttackPattern, AttackAlterConfig>> = {};

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
