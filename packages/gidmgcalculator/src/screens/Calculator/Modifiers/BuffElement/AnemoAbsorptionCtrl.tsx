import { AttackBonuses, ElementType, Level } from "@Calculation";
import { useState } from "react";
import { SelectOption, VersatileSelect } from "rond";

import { ElementModCtrl } from "@/types";
import { updateCalcSetup } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";

import { GenshinModifierView } from "@/components";
import { AttackReactionCtrl } from "./AttackReactionCtrl";

type AnemoAbsorptionCtrlProps = {
  elmtModCtrls: ElementModCtrl;
  attkBonuses: AttackBonuses;
  characterLv: Level;
};

export function AnemoAbsorptionCtrl({ elmtModCtrls, attkBonuses, characterLv }: AnemoAbsorptionCtrlProps) {
  const { absorption } = elmtModCtrls;
  const dispatch = useDispatch();

  const [absorbedValue, setAbsorbedValue] = useState(absorption ?? "pyro");

  const ABSORB_OPTIONS: SelectOption<ElementType>[] = [
    { label: "pyro", value: "pyro", className: "capitalize" },
    { label: "hydro", value: "hydro", className: "capitalize" },
    { label: "electro", value: "electro", className: "capitalize" },
    { label: "cryo", value: "cryo", className: "capitalize" },
  ];

  const onToggleAbsorption = () => {
    dispatch(
      updateCalcSetup({
        elmtModCtrls: {
          ...elmtModCtrls,
          absorption: absorption ? null : absorbedValue,
          absorb_reaction: null,
        },
      })
    );
  };

  const onChangeAbsorbedElmt = (newAbsorption: ElementType) => {
    setAbsorbedValue(newAbsorption);

    dispatch(
      updateCalcSetup({
        elmtModCtrls: {
          ...elmtModCtrls,
          absorption: newAbsorption,
        },
      })
    );
  };

  return (
    <div>
      <GenshinModifierView
        heading="Anemo Absorption"
        description="Turns the element of Swirl and absorbing Anemo attacks into the selected element."
        mutable
        checked={absorption !== null}
        onToggle={onToggleAbsorption}
      />
      <div className="pt-2 pb-1 pr-1 flex items-center justify-end">
        <span className="mr-4 text-base leading-6 text-right">Absorbed Element</span>
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
            configType="absorb_reaction"
            attackElmt={absorption}
            elmtModCtrls={elmtModCtrls}
            attkBonuses={attkBonuses}
            characterLv={characterLv}
          />
        </div>
      ) : null}
    </div>
  );
}
