import type { CalcSetup, Target } from "@Src/types";
import type { CalculationInfo } from "../types";

import { $AppArtifact, $AppCharacter } from "@Src/services";
import Array_ from "@Src/utils/array-utils";
import { ResistanceReductionControl, TrackerControl } from "../controls";
import { isGrantedEffect } from "../calculation-utils/isGrantedEffect";

export default function getResistances(
  { char, party, customDebuffCtrls, selfDebuffCtrls, artDebuffCtrls, elmtModCtrls }: CalcSetup,
  info: CalculationInfo,
  target: Target,
  tracker?: TrackerControl
) {
  const { appChar } = info;
  const resistReductCtrl = new ResistanceReductionControl(info, tracker);

  // APPLY CUSTOM DEBUFFS
  for (const control of customDebuffCtrls) {
    resistReductCtrl.add(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const ctrl of selfDebuffCtrls) {
    const debuff = Array_.findByIndex(appChar.debuffs || [], ctrl.index);

    if (ctrl.activated && debuff?.effects && isGrantedEffect(debuff, char)) {
      resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], true, `Self / ${debuff.src}`);
    }
  }

  // APPLY PARTY DEBUFFS
  for (const teammate of party) {
    if (!teammate) continue;
    const { debuffs = [] } = $AppCharacter.get(teammate.name);

    for (const ctrl of teammate.debuffCtrls) {
      const debuff = Array_.findByIndex(debuffs, ctrl.index);

      if (ctrl.activated && debuff?.effects) {
        resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], false, `Self / ${debuff.src}`);
      }
    }
  }

  // APPLY ARTIFACT DEBUFFS
  for (const ctrl of artDebuffCtrls) {
    const { name, debuffs = [] } = $AppArtifact.getSet(ctrl.code) || {};
    const debuff = debuffs[ctrl.index];

    if (ctrl.activated && debuff?.effects) {
      resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], false, `${name} / 4-piece activated`);
    }
  }

  // APPLY RESONANCE DEBUFFS
  const geoRsn = elmtModCtrls.resonances.find((rsn) => rsn.vision === "geo");
  if (geoRsn && geoRsn.activated) {
    resistReductCtrl.add("geo", 20, "Geo resonance");
  }
  if (elmtModCtrls.superconduct) {
    resistReductCtrl.add("phys", 40, "Superconduct");
  }
  return resistReductCtrl.applyTo(target);
}
