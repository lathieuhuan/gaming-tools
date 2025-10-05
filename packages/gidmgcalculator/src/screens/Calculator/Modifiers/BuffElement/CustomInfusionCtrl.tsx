import { AttackBonuses, ELEMENT_TYPES, ElementType, Level } from "@Calculation";
import { useState } from "react";
import { VersatileSelect } from "rond";

import { ElementModCtrl } from "@/types";
import { selectCustomInfusion, updateCalcSetup } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

import { GenshinModifierView } from "@/components";
import { AttackReactionCtrl } from "./AttackReactionCtrl";

type CustomInfusionCtrlProps = {
  elmtModCtrls: ElementModCtrl;
  attkBonuses: AttackBonuses;
  characterLv: Level;
  characterElmt: ElementType;
};

export function CustomInfusionCtrl({ elmtModCtrls, attkBonuses, characterLv, characterElmt }: CustomInfusionCtrlProps) {
  const dispatch = useDispatch();
  const customInfusion = useSelector(selectCustomInfusion);
  const { element: infusedElement } = customInfusion;
  const isInfused = infusedElement !== "phys";

  const [infusedValue, setInfusedValue] = useState(infusedElement === "phys" ? "pyro" : infusedElement);

  const onToggleInfusion = () => {
    dispatch(
      updateCalcSetup({
        elmtModCtrls: {
          ...elmtModCtrls,
          infuse_reaction: null,
        },
        customInfusion: {
          ...customInfusion,
          element: isInfused ? "phys" : infusedValue,
        },
      })
    );
  };

  const onChangeInfusedElmt = (element: ElementType) => {
    //
    setInfusedValue(element);

    dispatch(
      updateCalcSetup({
        elmtModCtrls: {
          ...elmtModCtrls,
          infuse_reaction: null,
        },
        customInfusion: {
          ...customInfusion,
          element,
        },
      })
    );
  };

  return (
    <div>
      <GenshinModifierView
        heading="Custom Infusion"
        description={
          <>
            This infusion overwrites self infusion but does not overwrite elemental nature of attacks{" "}
            <span className="text-light-hint">(Catalyst's attacks, Bow's fully-charge aim shot)</span>.
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
          options={ELEMENT_TYPES.map((item) => ({
            label: item,
            value: item,
            className: "capitalize",
          }))}
          disabled={!isInfused}
          value={infusedValue}
          onChange={onChangeInfusedElmt}
        />
      </div>

      {/*
        Checking infusedElement !== characterElmt because self infusion is always the same as characterElmt for now.
        If they are different, need to check infusedElement !== self infusion
      */}
      {infusedElement !== "phys" && infusedElement !== characterElmt ? (
        <div className="mt-3 space-y-3">
          <AttackReactionCtrl
            configType="infuse_reaction"
            attackElmt={infusedElement}
            elmtModCtrls={elmtModCtrls}
            attkBonuses={attkBonuses}
            characterLv={characterLv}
          />
        </div>
      ) : null}
    </div>
  );
}
