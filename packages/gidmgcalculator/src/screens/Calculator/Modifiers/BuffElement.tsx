import { useState } from "react";
import { SelectOption, VersatileSelect } from "rond";
import {
  AmplifyingReaction,
  AttackElement,
  ELEMENT_TYPES,
  ElementType,
  QuickenReaction,
  TalentCalcItem,
} from "@Backend";

import { Resonance } from "@Src/types";
import {
  selectAttkBonuses,
  selectCharacter,
  selectCustomInfusion,
  selectElmtModCtrls,
  updateCalcSetup,
  updateResonance,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useCharacterData } from "../ContextProvider";

//
import {
  GenshinModifierView,
  QuickenBuffItem,
  RESONANCE_INFO,
  ResonanceBuffItem,
  VapMeltBuffItem,
} from "@Src/components";

type ReactionConfigType = "reaction" | "infuse_reaction" | "absorb_reaction";

export default function BuffElement() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const elmtModCtrls = useSelector(selectElmtModCtrls);
  const attkBonuses = useSelector(selectAttkBonuses);
  const customInfusion = useSelector(selectCustomInfusion);

  const { vision, weaponType, calcList } = useCharacterData().appCharacter;

  const { element: infusedElement } = customInfusion;
  const { absorption } = elmtModCtrls;
  const isInfused = infusedElement !== "phys";

  const [infusedValue, setInfusedValue] = useState(infusedElement === "phys" ? "pyro" : infusedElement);
  const [absorbedValue, setAbsorbedValue] = useState(absorption ?? "pyro");

  // ===== Reaction renderers =====

  const renderAmplifying = (element: ElementType, field: ReactionConfigType, reaction: AmplifyingReaction) => {
    const activated = elmtModCtrls[field] === reaction;

    return (
      <VapMeltBuffItem
        key={reaction}
        mutable
        checked={activated}
        {...{ reaction, element, attkBonuses }}
        onToggle={() => {
          dispatch(
            updateCalcSetup({
              elmtModCtrls: {
                ...elmtModCtrls,
                [field]: activated ? null : reaction,
              },
            })
          );
        }}
      />
    );
  };

  const renderQuicken = (element: ElementType, field: ReactionConfigType, reaction: QuickenReaction) => {
    const activated = elmtModCtrls[field] === reaction;

    return (
      <QuickenBuffItem
        key={reaction}
        mutable
        checked={activated}
        {...{ reaction, element, characterLv: character.level, attkBonuses }}
        onToggle={() => {
          dispatch(
            updateCalcSetup({
              elmtModCtrls: {
                ...elmtModCtrls,
                [field]: activated ? null : reaction,
              },
            })
          );
        }}
      />
    );
  };

  const renderAttackReaction = (configType: ReactionConfigType) => {
    let element: AttackElement | null;

    switch (configType) {
      case "reaction":
        element = vision;
        break;
      case "infuse_reaction":
        element = infusedElement;
        break;
      case "absorb_reaction":
        element = absorption;
        break;
    }

    switch (element) {
      case "pyro":
        return (
          <>
            {renderAmplifying(element, configType, "melt")}
            {renderAmplifying(element, configType, "vaporize")}
          </>
        );
      case "hydro":
        return renderAmplifying(element, configType, "vaporize");
      case "cryo":
        return renderAmplifying(element, configType, "melt");
      case "electro":
        return renderQuicken(element, configType, "aggravate");
      case "dendro":
        return renderQuicken(element, configType, "spread");
      default:
        return null;
    }
  };

  // ========== ANEMO ABSORPTION ==========

  let anemoAbsorptionConfig: JSX.Element | null = null;

  const haveAnyAbsorbAttack = (items: TalentCalcItem[]) => {
    return items.some(({ type = "attack", attElmt }) => attElmt === "absorb" && type === "attack");
  };

  if (
    (vision === "anemo" && weaponType === "catalyst") ||
    haveAnyAbsorbAttack(calcList.ES) ||
    haveAnyAbsorbAttack(calcList.EB)
  ) {
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

    anemoAbsorptionConfig = (
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

        {absorption ? <div className="mt-3 space-y-3">{renderAttackReaction("absorb_reaction")}</div> : null}
      </div>
    );
  }

  // ========== CUSTOM INFUSION ==========

  let customInfusionConfig: JSX.Element | null = null;

  if (weaponType !== "catalyst") {
    //
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

    customInfusionConfig = (
      <div>
        <GenshinModifierView
          heading="Custom Infusion"
          description={
            <>
              This infusion overwrites self infusion but does not overwrite elemental nature of attacks{" "}
              <span className="text-hint-color">(Catalyst's attacks, Bow's fully-charge aim shot)</span>.
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
          Checking infusedElement !== vision works because self infusion is always the same as vision for now.
          If they are different, need to check infusedElement !== self infusion
        */}
        {infusedElement !== "phys" && infusedElement !== vision ? (
          <div className="mt-3 space-y-3">{renderAttackReaction("infuse_reaction")}</div>
        ) : null}
      </div>
    );
  }

  // Resonance

  const onToggleResonance = (resonance: Resonance) => {
    dispatch(
      updateResonance({
        ...resonance,
        activated: !resonance.activated,
      })
    );
  };

  const onToggleResonanceCondition = (resonance: Resonance) => (currentInput: number, inputIndex: number) => {
    if (resonance.inputs) {
      const newInputs = [...resonance.inputs];
      newInputs[inputIndex] = currentInput === 1 ? 0 : 1;

      dispatch(updateResonance({ ...resonance, inputs: newInputs }));
    }
  };

  const dividerRender = <div className="peer-empty:hidden mx-auto my-3 w-1/2 h-px bg-surface-3" />;

  return (
    <div className="pt-2">
      <div>
        <div className="space-y-3 peer">
          {elmtModCtrls.resonances.map((resonance) => {
            return (
              <ResonanceBuffItem
                key={resonance.vision}
                mutable
                element={resonance.vision}
                checked={resonance.activated}
                onToggle={() => onToggleResonance(resonance)}
                inputs={resonance.inputs}
                inputConfigs={RESONANCE_INFO[resonance.vision]?.inputConfigs}
                onToggleCheck={onToggleResonanceCondition(resonance)}
              />
            );
          })}
        </div>
        {dividerRender}
      </div>

      <div>
        <div className="space-y-3 peer">{renderAttackReaction("reaction")}</div>
        {dividerRender}
      </div>

      <div>
        <div className="peer">{anemoAbsorptionConfig}</div>
        {dividerRender}
      </div>

      {customInfusionConfig}
    </div>
  );
}
