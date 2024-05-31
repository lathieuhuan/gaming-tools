import type { Artifact, Character, ElementModCtrl, PartyData, Weapon } from "@Src/types";
import type { AppCharacter, AppWeapon } from "@Src/backend/types";
import type { BuffInfoWrap, StackableCheckCondition } from "@Src/backend/appliers";

import { AttackBonusControl, TotalAttributeControl, calcArtifactAtribute } from "@Src/backend/controls";
import { GeneralCalc, WeaponCalc } from "@Src/backend/utils";

type GetMemberStatArgs = {
  char: Character;
  appChar: AppCharacter;
  weapon: Weapon;
  appWeapon: AppWeapon;
  artifacts: (Artifact | null)[];
  partyData: PartyData;
  elmtModCtrls: ElementModCtrl;
};
export function getMemberStat({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  partyData,
  elmtModCtrls,
}: GetMemberStatArgs) {
  const { refi } = weapon;
  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls;

  const totalAttr = new TotalAttributeControl(
    char,
    appChar,
    WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale)
    // tracker
  );

  calcArtifactAtribute(artifacts, totalAttr);

  const attBonus = new AttackBonusControl();

  if (appWeapon.subStat) {
    const subStatValue = WeaponCalc.getSubStatValue(weapon.level, appWeapon.subStat.scale);
    totalAttr.addStable(appWeapon.subStat.type, subStatValue, `${appWeapon.name} sub-stat`);
  }

  const infoWrap: BuffInfoWrap = {
    char,
    appChar,
    partyData,
    totalAttr,
    attBonus,
  };

  const usedMods: NonNullable<StackableCheckCondition>[] = [];
}
