import { useState } from "react";
import { VersatileSelect } from "rond";
import { AmplifyingReaction, ELEMENT_TYPES, ElementType, QuickenReaction, TalentCalcItem } from "@Backend";

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

export default function BuffElement() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const elmtModCtrls = useSelector(selectElmtModCtrls);
  const attkBonuses = useSelector(selectAttkBonuses);
  const customInfusion = useSelector(selectCustomInfusion);

  const { vision, weaponType, calcList } = useCharacterData().appCharacter;

  const { element: infusedElement } = customInfusion;
  const isInfused = infusedElement !== "phys";
  const isAbsorbing = !!elmtModCtrls.absorption;

  const [infusedValue, setInfusedValue] = useState(infusedElement === "phys" ? "pyro" : infusedElement);
  const [absorbedValue, setAbsorbedValue] = useState(elmtModCtrls.absorption ?? "pyro");

  // ===== Reaction renderers =====

  const renderAmplifying = (
    element: ElementType,
    field: "reaction" | "infuse_reaction",
    reaction: AmplifyingReaction
  ) => {
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

  const renderQuicken = (element: ElementType, field: "reaction" | "infuse_reaction", reaction: QuickenReaction) => {
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

  const renderAttackReaction = (attReaction: "reaction" | "infuse_reaction") => {
    const element = attReaction === "reaction" ? vision : infusedElement;

    switch (element) {
      case "pyro":
        return (
          <>
            {renderAmplifying(element, attReaction, "melt")}
            {renderAmplifying(element, attReaction, "vaporize")}
          </>
        );
      case "hydro":
        return renderAmplifying(element, attReaction, "vaporize");
      case "cryo":
        return renderAmplifying(element, attReaction, "melt");
      case "electro":
        return renderQuicken(element, attReaction, "aggravate");
      case "dendro":
        return renderQuicken(element, attReaction, "spread");
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
    anemoAbsorptionConfig = (
      <div>
        <GenshinModifierView
          heading="Anemo Absorption"
          description="Turns the element of Swirl and absorbing Anemo attacks into the selected element."
          mutable
          checked={isAbsorbing}
          onToggle={() => {
            dispatch(
              updateCalcSetup({
                elmtModCtrls: {
                  ...elmtModCtrls,
                  absorption: isAbsorbing ? null : absorbedValue,
                },
              })
            );
          }}
        />
        <div className="pt-2 pb-1 pr-1 flex items-center justify-end">
          <span className="mr-4 text-base leading-6 text-right">Absorbed Element</span>
          <VersatileSelect
            title="Select Absorbed Element"
            className="w-24 h-8 font-bold capitalize"
            options={["pyro", "hydro", "electro", "cryo"].map((item) => ({
              label: item,
              value: item,
              className: "capitalize",
            }))}
            disabled={!isAbsorbing}
            value={absorbedValue}
            onChange={(value) => {
              const absorption = value as ElementType;
              setAbsorbedValue(absorption);

              dispatch(
                updateCalcSetup({
                  elmtModCtrls: {
                    ...elmtModCtrls,
                    absorption,
                  },
                })
              );
            }}
          />
        </div>
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
            infuse_reaction: isInfused ? null : elmtModCtrls.infuse_reaction,
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
