import type {
  ArtifactDebuffCtrl,
  Character,
  CustomDebuffCtrl,
  ElementModCtrl,
  ModifierCtrl,
  Party,
  PartyData,
  Target,
} from "@Src/types";
import type { AppCharacter } from "@Src/backend/types";

import { $AppArtifact, $AppCharacter } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { EntityCalc } from "@Src/backend/utils";
import { ResistanceReductionControl, TrackerControl } from "@Src/backend/controls";
import { CalcDebuffApplier } from "@Src/backend/appliers";

type GetResistancesArgs = {
  char: Character;
  appChar: AppCharacter;
  party: Party;
  partyData: PartyData;
  customDebuffCtrls: CustomDebuffCtrl[];
  selfDebuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  elmtModCtrls: ElementModCtrl;
  target: Target;
  tracker?: TrackerControl;
};

export default function getResistances({
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

  const debuffApplier = new CalcDebuffApplier(
    {
      char,
      appChar,
      partyData,
    },
    resistReduct
  );

  // APPLY CUSTOM DEBUFFS
  for (const control of customDebuffCtrls) {
    resistReduct.add(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const ctrl of selfDebuffCtrls) {
    const debuff = findByIndex(appChar.debuffs || [], ctrl.index);

    if (ctrl.activated && debuff?.effects && EntityCalc.isGrantedEffect(debuff, char)) {
      debuffApplier.applyCharacterDebuff({
        description: `Self / ${debuff.src}`,
        debuff,
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
        debuffApplier.applyCharacterDebuff({
          description: `Self / ${debuff.src}`,
          debuff,
          inputs: ctrl.inputs ?? [],
          fromSelf: false,
        });
      }
    }
  }

  // APPLY ARTIFACT DEBUFFS
  for (const ctrl of artDebuffCtrls) {
    const { name, debuffs = [] } = $AppArtifact.getSet(ctrl.code) || {};
    const debuff = debuffs[ctrl.index];

    if (ctrl.activated && debuff?.effects) {
      debuffApplier.applyArtifactDebuff({
        debuff,
        inputs: ctrl.inputs ?? [],
        description: `${name} / 4-piece activated`,
        fromSelf: false,
      });
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
