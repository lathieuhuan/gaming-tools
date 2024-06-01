import type { ElementModCtrl, PartyData, SimulationMember, SimulationTarget } from "@Src/types";
import type { AppCharacter, AppWeapon } from "@Src/backend/types";

import { pickProps } from "@Src/utils";
import getMemberStats from "./getMemberStats";
import getResistances from "./getResistances";

type CalculateMemberArgs = {
  member: SimulationMember;
  appChar: AppCharacter;
  appWeapon: AppWeapon;
  partyData: PartyData;
  elmtModCtrls: ElementModCtrl;
  target: SimulationTarget;
};

export function calculateMember({
  member,
  appChar,
  appWeapon,
  partyData,
  elmtModCtrls,
  target,
}: CalculateMemberArgs) {
  const char = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB"]);

  const { totalAttr, attBonus } = getMemberStats({
    char,
    appChar,
    weapon: member.weapon,
    appWeapon,
    artifacts: member.artifacts,
    partyData,
    selfBuffCtrls: member.buffCtrls,
    elmtModCtrls: member.elmtModCtrls,
  });

  const resistances = getResistances({
    char,
    appChar,
    // party,
    partyData,
    // customDebuffCtrls,
    elmtModCtrls,
    // selfDebuffCtrls,
    // artDebuffCtrls,
    target,
    // tracker,
  });

  const configAttackPattern = AttackPatternConf({
    char,
    appChar,
    partyData,
    selfBuffCtrls: member.buffCtrls,
    elmtModCtrls,
    customInfusion: member.customInfusion,
    attBonus,
  });

  return {
    totalAttr,
  };
}
