import { Fragment, useState } from "react";
import type { AmplifyingReaction, CalcItem, ModInputConfig, ElementType } from "@Src/types";

import { ELEMENT_TYPES } from "@Src/constants";
import { $AppCharacter } from "@Src/services";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectCharacter,
  selectElmtModCtrls,
  selectRxnBonus,
  updateCalcSetup,
  updateResonance,
} from "@Store/calculator-slice";

// Component
import {
  ModifierTemplate,
  ResonanceModTemplate,
  // resonanceRenderInfo,
  // renderVapMeltDescription,
  // renderVapMeltHeading,
  // renderQuickenDescription,
  // renderQuickenHeading,
} from "@Src/components";

const hasAbsorbingAttackIn = (items: CalcItem[]) => {
  return items.some((item) => item.attElmt === "absorb");
};

export const ElementBuffs = () => {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const { vision: elementType, weaponType, calcList } = $AppCharacter.get(char.name);
  const elmtModCtrls = useSelector(selectElmtModCtrls);
  const rxnBonus = useSelector(selectRxnBonus);
  const customInfusion = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].customInfusion);

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
      <ModifierTemplate
        key={reaction}
        checked={activated}
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
        heading={renderVapMeltHeading(element, reaction)}
        description={renderVapMeltDescription(element, getAmplifyingMultiplier(element, rxnBonus)[reaction])}
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
      <ModifierTemplate
        key={reaction}
        checked={activated}
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
        heading={renderQuickenHeading(element, reaction)}
        description={renderQuickenDescription(element, getQuickenBuffDamage(char.level, rxnBonus)[reaction])}
      />
    );
  };

  const renderAttackReaction = (attReaction: "reaction" | "infuse_reaction", forceElement?: ElementType | null) => {
    const element =
      forceElement === undefined ? (attReaction === "reaction" ? elementType : infusedElement) : forceElement;

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
      <div>
        {elmtModCtrls.resonances.map((resonance) => {
          const inputConfigs: ModInputConfig[] =
            resonance.vision === "dendro"
              ? [
                  { label: "Trigger Aggravate, Spread, Hyperbloom, Burgeon", type: "check" },
                  { label: "Trigger Burning, Quicken, Bloom", type: "check" },
                ]
              : [];

          return (
            <ResonanceModTemplate
              key={resonance.vision}
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
              inputConfigs={inputConfigs}
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
        <ModifierTemplate
          heading="Anemo Absorption"
          description="Enable Anemo absorption on attacks that can absorb one of below elements."
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
          <select
            className="styled-select capitalize"
            value={absorbedValue}
            disabled={!isAbsorbing}
            onChange={(e) => {
              const absorption = e.target.value as ElementType;
              setAbsorbedValue(absorption);

              dispatch(
                updateCalcSetup({
                  elmtModCtrls: {
                    ...elmtModCtrls,
                    absorption: absorption,
                  },
                })
              );
            }}
          >
            {["pyro", "hydro", "electro", "cryo"].map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
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
        <ModifierTemplate
          heading="Custom Infusion"
          description={
            <>
              This infusion overwrites self infusion but does not overwrite elemental nature of attacks{" "}
              <span className="text-light-800">(Catalyst's attacks, Bow's fully-charge aim shot)</span>.
            </>
          }
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
          <select
            className="styled-select capitalize"
            value={infusedValue}
            disabled={!isInfused}
            onChange={(e) => {
              setInfusedValue(e.target.value as ElementType);

              dispatch(
                updateCalcSetup({
                  elmtModCtrls: {
                    ...elmtModCtrls,
                    infuse_reaction: null,
                  },
                  customInfusion: {
                    ...customInfusion,
                    element: e.target.value as ElementType,
                  },
                })
              );
            }}
          >
            {ELEMENT_TYPES.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {infusedElement !== elementType && infusedElement !== "phys" ? (
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
            {i ? <div className="mx-auto my-3 w-1/2 h-px bg-dark-500" /> : null}
            {item}
          </Fragment>
        );
      })}
    </div>
  );
};
