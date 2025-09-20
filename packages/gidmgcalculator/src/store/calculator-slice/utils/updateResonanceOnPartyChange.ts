import { AppCharactersByName, CalcSetup, ElementModCtrl, Resonance } from "@/types";
import TypeCounter from "@/utils/TypeCounter";
import { ElementType } from "@Calculation";

const RESONANCE_ELEMENT_TYPES: ElementType[] = ["pyro", "cryo", "geo", "hydro", "dendro"];

export function updateResonanceOnPartyChange(
  ctrl: ElementModCtrl,
  setup: CalcSetup,
  data: AppCharactersByName
) {
  const { char, party } = setup;
  const elmtCount = new TypeCounter<ElementType>();

  elmtCount.add(data[char.name].vision);

  party.forEach((member) => {
    if (member && data[member.name]) {
      elmtCount.add(data[member.name].vision);
    }
  });

  ctrl.resonances = ctrl.resonances.filter((resonance) => elmtCount.get(resonance.vision) >= 2);

  for (const elmtType of RESONANCE_ELEMENT_TYPES) {
    if (elmtCount.get(elmtType) >= 2) {
      const exist = ctrl.resonances.find((resonance) => resonance.vision === elmtType);

      if (!exist) {
        const newResonance: Resonance = {
          vision: elmtType,
          activated: ["pyro", "hydro", "dendro"].includes(elmtType),
        };

        if (elmtType === "dendro") {
          newResonance.inputs = [0, 0];
        }

        ctrl.resonances.push(newResonance);
      }
    }
  }
}
