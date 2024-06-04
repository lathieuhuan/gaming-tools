import type { CalcArtifacts, CalcCharacter, CalcWeapon, SimulationAttributeBonus } from "@Src/types";
import type { AppCharacter, AppWeapon } from "@Src/backend/types";

import { TotalAttributeControl, getArtifactAttribute, type TrackerControl } from "@Src/backend/controls";
import { WeaponCalc } from "@Src/backend/utils";

export type GetMemberStatsArgs = {
  char: CalcCharacter;
  appChar: AppCharacter;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  artifacts: CalcArtifacts;
  attributeBonus: SimulationAttributeBonus[];
  tracker?: TrackerControl;
};

export default function getMemberStats({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  attributeBonus,
  tracker,
}: GetMemberStatsArgs) {
  const totalAttr = new TotalAttributeControl(
    char,
    appChar,
    WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale),
    tracker
  );

  getArtifactAttribute(artifacts, totalAttr);

  if (appWeapon.subStat) {
    const subStatValue = WeaponCalc.getSubStatValue(weapon.level, appWeapon.subStat.scale);
    totalAttr.addStable(appWeapon.subStat.type, subStatValue, `${appWeapon.name} sub-stat`);
  }

  for (const bonus of attributeBonus) {
    const description = `${bonus.trigger.character} / ${bonus.trigger.src}`;

    bonus.stable
      ? totalAttr.addStable(bonus.to, bonus.value, description)
      : totalAttr.addUnstable(bonus.to, bonus.value, description);
  }

  return {
    totalAttr: totalAttr.finalize(),
  };
}
