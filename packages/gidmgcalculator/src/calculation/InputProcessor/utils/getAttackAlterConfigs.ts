import { NORMAL_ATTACKS, type AttackPattern, type CalcTeamData } from "@Calculation";
import { AttackAlterConfig } from "@/calculation/types";
import type { ModifierCtrl } from "@/types";
import Array_ from "@/utils/array-utils";

export const getAttackAlterConfigs = (teamData: CalcTeamData, selfBuffCtrls: ModifierCtrl[]) => {
  const configs: Partial<Record<AttackPattern, AttackAlterConfig>> = {};

  for (const ctrl of selfBuffCtrls) {
    const buff = ctrl.activated ? Array_.findByIndex(teamData.activeAppMember.buffs, ctrl.index) : undefined;
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
