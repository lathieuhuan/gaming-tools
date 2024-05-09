import type { DebuffInfoWrap, GetResistancesArgs } from "./getResistances.types";

import { $AppCharacter, $AppData } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { EntityCalc } from "../utils";
import { ResistanceReductionControl } from "../controls";
import { applyPenalty } from "./getResistances.utils";
import ApplierCharacterDebuff from "./applier-character-debuff";

export function getResistances({
  char,
  appChar,
  party,
  partyData,
  customDebuffCtrls,
  selfDebuffCtrls,
  artDebuffCtrls,
  elmtModCtrls,
  target,
  tracker,
}: GetResistancesArgs) {
  const resistReduct = new ResistanceReductionControl(tracker);

  const infoWrap: DebuffInfoWrap = {
    char,
    appChar,
    partyData,
    resistReduct,
  };
  const characterDebuff = new ApplierCharacterDebuff(infoWrap);

  // APPLY CUSTOM DEBUFFS
  for (const control of customDebuffCtrls) {
    resistReduct.add(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const ctrl of selfDebuffCtrls) {
    const debuff = findByIndex(appChar.debuffs || [], ctrl.index);

    if (ctrl.activated && debuff?.effects && EntityCalc.isGrantedEffect(debuff, char)) {
      characterDebuff.apply({
        description: `Self / ${debuff.src}`,
        effects: debuff.effects,
        inputs: ctrl.inputs ?? [],
        fromSelf: true,
      });
    }
  }

  // APPLY PARTY DEBUFFS
  for (const teammate of party) {
    if (!teammate) continue;
    const { debuffs = [] } = $AppCharacter.get(teammate.name);

    for (const ctrl of teammate.debuffCtrls) {
      const debuff = findByIndex(debuffs, ctrl.index);

      if (ctrl.activated && debuff?.effects) {
        characterDebuff.apply({
          description: `Self / ${debuff.src}`,
          effects: debuff.effects,
          inputs: ctrl.inputs ?? [],
          fromSelf: false,
        });
      }
    }
  }

  // APPLY ARTIFACT DEBUFFS
  for (const ctrl of artDebuffCtrls) {
    if (ctrl.activated) {
      const { name, debuffs = [] } = $AppData.getArtifactSet(ctrl.code) || {};
      const { effects } = debuffs[ctrl.index] || {};

      if (effects) {
        applyPenalty({
          penaltyValue: effects.value,
          targets: effects.targets,
          info: infoWrap,
          inputs: ctrl.inputs ?? [],
          description: `${name} / 4-piece activated`,
        });
      }
    }
  }

  // APPLY RESONANCE DEBUFFS
  const geoRsn = elmtModCtrls.resonances.find((rsn) => rsn.vision === "geo");
  if (geoRsn && geoRsn.activated) {
    resistReduct.add("geo", 20, "Geo resonance");
  }
  if (elmtModCtrls.superconduct) {
    resistReduct.add("phys", 40, "Superconduct");
  }
  return resistReduct.apply(target);
}
