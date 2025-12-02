import { useState } from "react";
import { VersatileSelect } from "rond";

import type { CalcCharacter } from "@/models/base";
import type { ElementalEvent, ElementType } from "@/types";

import { ELEMENT_TYPES } from "@/constants";
import { updateElementalEvent } from "@Store/calculator/actions";

import { GenshinModifierView } from "@/components";
import { AttackReactionCtrl } from "./AttackReactionCtrl";

type CustomInfusionCtrlProps = {
  elmtEvent: ElementalEvent;
  character: CalcCharacter;
};

export function CustomInfusionCtrl({ elmtEvent, character }: CustomInfusionCtrlProps) {
  const [infusedValue, setInfusedValue] = useState(elmtEvent.infusion ?? "pyro");

  const isInfused = !!elmtEvent.infusion;

  const elmtOptions = ELEMENT_TYPES.map((item) => ({
    label: item,
    value: item,
    className: "capitalize",
  }));

  const onToggleInfusion = () => {
    updateElementalEvent({
      infusion: isInfused ? null : infusedValue,
      infuseReaction: null,
    });
  };

  const onChangeInfusedElmt = (element: ElementType) => {
    //
    setInfusedValue(element);

    updateElementalEvent({
      infusion: element,
      infuseReaction: null,
    });
  };

  return (
    <div>
      <GenshinModifierView
        heading="Custom Infusion"
        description={
          <>
            This infusion overwrites self infusion but does not overwrite elemental nature of
            attacks{" "}
            <span className="text-light-hint">
              (Catalyst's attacks, Bow's fully-charge aim shot)
            </span>
            .
          </>
        }
        mutable
        checked={isInfused}
        onToggle={onToggleInfusion}
      />
      <div className="pt-2 pb-1 pr-1 flex items-center justify-end">
        <span className="mr-4 text-base leading-6 text-right">Element</span>

        <VersatileSelect
          title="Select Element"
          className="w-24 h-8 font-bold capitalize"
          options={elmtOptions}
          disabled={!isInfused}
          value={infusedValue}
          onChange={onChangeInfusedElmt}
        />
      </div>

      {/*
        Checking infusedElement !== characterElmt because self infusion is always the same as characterElmt for now.
        If they are different, need to check infusedElement !== self infusion
      */}
      {isInfused && elmtEvent.infusion !== character.data.vision ? (
        <div className="mt-3 space-y-3">
          <AttackReactionCtrl
            configType="infuseReaction"
            attackElmt={elmtEvent.infusion}
            character={character}
            elmtEvent={elmtEvent}
          />
        </div>
      ) : null}
    </div>
  );
}
