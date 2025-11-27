import { useState } from "react";
import { SelectOption, VersatileSelect } from "rond";

import type { ElementType, ElementalEvent } from "@/types";
import type { CalcCharacter } from "@/models/base";

import { updateElementalEvent } from "@Store/calculator/actions";

import { GenshinModifierView } from "@/components";
import { AttackReactionCtrl } from "./AttackReactionCtrl";

type AnemoAbsorptionCtrlProps = {
  elmtEvent: ElementalEvent;
  character: CalcCharacter;
};

export function AnemoAbsorptionCtrl({ elmtEvent, character }: AnemoAbsorptionCtrlProps) {
  const { absorption } = elmtEvent;

  const [absorbedValue, setAbsorbedValue] = useState(absorption ?? "pyro");

  const ABSORB_OPTIONS: SelectOption<ElementType>[] = [
    { label: "pyro", value: "pyro", className: "capitalize" },
    { label: "hydro", value: "hydro", className: "capitalize" },
    { label: "electro", value: "electro", className: "capitalize" },
    { label: "cryo", value: "cryo", className: "capitalize" },
  ];

  const onToggleAbsorption = () => {
    updateElementalEvent({
      absorption: absorption ? null : absorbedValue,
      absorbReaction: null,
    });
  };

  const onChangeAbsorbedElmt = (newAbsorption: ElementType) => {
    setAbsorbedValue(newAbsorption);

    updateElementalEvent({
      absorption: newAbsorption,
    });
  };

  return (
    <div>
      <GenshinModifierView
        heading="Anemo Swirl / Absorption"
        description="Turns the element of Swirl and absorbing Anemo attacks into the selected element."
        mutable
        checked={absorption !== null}
        onToggle={onToggleAbsorption}
      />
      <div className="pt-2 pb-1 pr-1 flex items-center justify-end">
        <span className="mr-4 text-base leading-6 text-right">Swirled /Absorbed Element</span>
        <VersatileSelect
          title="Select Absorbed Element"
          className="w-24 h-8 font-bold capitalize"
          options={ABSORB_OPTIONS}
          disabled={!absorption}
          value={absorbedValue}
          onChange={onChangeAbsorbedElmt}
        />
      </div>

      {absorption ? (
        <div className="mt-3 space-y-3">
          <AttackReactionCtrl
            configType="absorbReaction"
            attackElmt={absorption}
            elmtEvent={elmtEvent}
            character={character}
          />
        </div>
      ) : null}
    </div>
  );
}
