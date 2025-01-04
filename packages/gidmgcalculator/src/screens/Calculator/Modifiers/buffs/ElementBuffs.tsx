import { Fragment, useState } from "react";
import { VersatileSelect } from "rond";
import { ELEMENT_TYPES, AmplifyingReaction, TalentCalcItem, ElementType } from "@Backend";

import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectCharacter,
  selectElmtModCtrls,
  selectAttkBonuses,
  updateCalcSetup,
  updateResonance,
} from "@Store/calculator-slice";
import { useCharacterData } from "../../ContextProvider";

//
import {
  GenshinModifierView,
  QuickenBuffItem,
  RESONANCE_INFO,
  ResonanceBuffItem,
  VapMeltBuffItem,
} from "@Src/components";

const hasAbsorbingAttackIn = (items: TalentCalcItem[]) => {
  return items.some((item) => !item.type || (item.type === "attack" && item.attElmt === "absorb"));
};

export default function ElementBuffs() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const elmtModCtrls = useSelector(selectElmtModCtrls);
  const attkBonuses = useSelector(selectAttkBonuses);
  const customInfusion = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].customInfusion);

  const { vision, weaponType, calcList } = useCharacterData().appCharacter;

  const { element: infusedElement } = customInfusion;
  const isInfused = infusedElement !== "phys";
  const isAbsorbing = !!elmtModCtrls.absorption;
  const hasAbsorbingAttack = hasAbsorbingAttackIn(calcList.ES) || hasAbsorbingAttackIn(calcList.EB);

  const [infusedValue, setInfusedValue] = useState(infusedElement === "phys" ? "pyro" : infusedElement);
  const [absorbedValue, setAbsorbedValue] = useState(elmtModCtrls.absorption ?? "pyro");

  const renderedElmts: JSX.Element[] = [];

  // ===== Reaction renderers =====
  const renderMeltVaporize = (
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

  const renderSpreadAggravate = (
    element: ElementType,
    field: "reaction" | "infuse_reaction",
    reaction: "spread" | "aggravate"
  ) => {
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

  const renderAttackReaction = (attReaction: "reaction" | "infuse_reaction", forceElement?: ElementType | null) => {
    const element = forceElement === undefined ? (attReaction === "reaction" ? vision : infusedElement) : forceElement;

    switch (element) {
      case "pyro":
        return (
          <div className="space-y-3">
            {renderMeltVaporize(element, attReaction, "melt")}
            {renderMeltVaporize(element, attReaction, "vaporize")}
          </div>
        );
        break;
      case "hydro":
        return renderMeltVaporize(element, attReaction, "vaporize");
      case "cryo":
        return renderMeltVaporize(element, attReaction, "melt");
      case "electro":
        return renderSpreadAggravate(element, attReaction, "aggravate");
      case "dendro":
        return renderSpreadAggravate(element, attReaction, "spread");
      default:
        return null;
    }
  };

  // ========== RESONANCE ==========
  if (elmtModCtrls.resonances.length) {
    renderedElmts.push(
      <div className="space-y-3">
        {elmtModCtrls.resonances.map((resonance) => {
          return (
            <ResonanceBuffItem
              key={resonance.vision}
              mutable
              element={resonance.vision}
              checked={resonance.activated}
              onToggle={() => {
                dispatch(
                  updateResonance({
                    ...resonance,
                    activated: !resonance.activated,
                  })
                );
              }}
              inputs={resonance.inputs}
              inputConfigs={RESONANCE_INFO[resonance.vision]?.inputConfigs}
              onToggleCheck={(currentInput, inputIndex) => {
                if (resonance.inputs) {
                  const newInputs = [...resonance.inputs];
                  newInputs[inputIndex] = currentInput === 1 ? 0 : 1;

                  dispatch(updateResonance({ ...resonance, inputs: newInputs }));
                }
              }}
            />
          );
        })}
      </div>
    );
  }

  // ========== ANEMO ABSORPTION ==========
  if (hasAbsorbingAttack) {
    renderedElmts.push(
      <div key="absorption">
        <GenshinModifierView
          heading="Anemo Absorption"
          description="Enable Anemo absorption on attacks that can absorb one of below elements."
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

  // ========== ABSORBING ATTACK REACTION ==========
  const absorbingAttackReaction = renderAttackReaction("reaction", elmtModCtrls.absorption);

  if (hasAbsorbingAttack && absorbingAttackReaction) {
    renderedElmts.push(absorbingAttackReaction);
  }

  // ========== ATTACK REACTION ==========
  const attackReaction = renderAttackReaction("reaction");

  if (attackReaction) {
    renderedElmts.push(attackReaction);
  }

  // ========== CUSTOM INFUSION & ITS ATTACK REACTION ==========
  if (weaponType !== "catalyst") {
    renderedElmts.push(
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
          onToggle={() => {
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
          }}
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
            onChange={(value) => {
              const element = value as ElementType;
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
            }}
          />
        </div>

        {infusedElement !== vision && infusedElement !== "phys" ? (
          <div className="mt-3">{renderAttackReaction("infuse_reaction")}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pt-2">
      {renderedElmts.map((item, i) => {
        return (
          <Fragment key={i}>
            {i ? <div className="mx-auto my-3 w-1/2 h-px bg-surface-3" /> : null}
            {item}
          </Fragment>
        );
      })}
    </div>
  );
}
