import { useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { clsx } from "rond";

import type { CalculationAspect, Character, Party, Weapon } from "@Src/types";
import {
  selectCharacter,
  selectComparedIds,
  selectCalcFinalResult,
  selectParty,
  selectWeapon,
  selectStandardId,
  selectSetupManageInfos,
  updateCharacter,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { findById } from "@Src/utils";
import { FinalResultLayout, FinalResultView, type FinalResultLayoutProps } from "@Src/components";

type CellConfig = ReturnType<FinalResultLayoutProps["getRowConfig"]>["cells"][number];

const ASPECT_LABEL: Record<CalculationAspect, string> = {
  nonCrit: "Non-crit",
  crit: "Crit",
  average: "Average",
};

export function FinalResultCore() {
  const dispatch = useDispatch();
  const activeSetupName = useSelector((state) => {
    const { activeId, setupManageInfos } = state.calculator;
    return findById(setupManageInfos, activeId)?.name || "";
  });
  const char = useSelector(selectCharacter);
  const weapon = useSelector(selectWeapon);
  const party = useSelector(selectParty);
  const finalResult = useSelector(selectCalcFinalResult);
  const comparedIds = useSelector(selectComparedIds);

  if (comparedIds.length > 1) {
    return <FinalResultCompare comparedIds={comparedIds} {...{ char, weapon, party }} />;
  }

  return (
    <div className="h-full flex flex-col">
      <p className="mx-4 mb-2 font-bold text-center">{activeSetupName}</p>
      <div className="grow hide-scrollbar">
        <FinalResultView
          key={char.name}
          {...{ char, weapon, party, finalResult }}
          talentMutable
          onChangeTalentLevel={(type, level) => dispatch(updateCharacter({ [type]: level }))}
        />
      </div>
    </div>
  );
}

interface FinalResultCompareProps {
  char: Character;
  weapon: Weapon;
  party: Party;
  comparedIds: number[];
}
function FinalResultCompare({ comparedIds, ...layoutProps }: FinalResultCompareProps) {
  const setupManageInfos = useSelector(selectSetupManageInfos);
  const resultById = useSelector((state) => state.calculator.resultById);
  const standardId = useSelector(selectStandardId);
  const setupsById = useSelector((state) => state.calculator.setupsById);

  const [focusedAspect, setFocusedAspect] = useState<CalculationAspect>("average");

  const standardWeapon = setupsById[standardId].weapon.code;
  let showWeaponCalc = true;

  for (const id of comparedIds) {
    if (setupsById[id].weapon.code !== standardWeapon) {
      showWeaponCalc = false;
      break;
    }
  }

  const calculationAspects: CalculationAspect[] = ["nonCrit", "crit", "average"];

  const setupIds = [standardId].concat(comparedIds.filter((id) => id !== standardId));

  const headerConfigs: FinalResultLayoutProps["headerConfigs"] = setupIds.map((id) => {
    return {
      text: findById(setupManageInfos, id)?.name || "",
    };
  });

  const getValue = (setupId: number, mainKey: "NAs" | "ES" | "EB" | "WP_CALC" | "RXN", subKey: string) => {
    return resultById[setupId].finalResult[mainKey][subKey][focusedAspect];
  };

  const getComparedValue = (value: number | number[]) => {
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex">
        <p className="mr-2">Choose a focus</p>
        <select
          className="text-primary-1"
          value={focusedAspect}
          onChange={(e) => setFocusedAspect(e.target.value as CalculationAspect)}
        >
          {calculationAspects.map((aspect) => (
            <option key={aspect} value={aspect}>
              {ASPECT_LABEL[aspect]}
            </option>
          ))}
        </select>
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultLayout
          {...layoutProps}
          showWeaponCalc={showWeaponCalc}
          headerConfigs={headerConfigs}
          getRowConfig={(mainKey, subKey) => {
            const standardValue = getValue(standardId, mainKey, subKey);

            const cells = setupIds.map<CellConfig>((id, index) => {
              if (!index) {
                return {
                  value: standardValue,
                  className: "text-right",
                };
              }

              const value = resultById[id].finalResult[mainKey][subKey][focusedAspect];
              const comparedStandardValue = getComparedValue(standardValue);
              const diff = getComparedValue(value) - comparedStandardValue;
              const percenttDiff = comparedStandardValue
                ? Math.round((Math.abs(diff) * 1000) / comparedStandardValue) / 10
                : 0;

              if (percenttDiff < 0.1) {
                return {
                  value,
                  className: "text-right",
                };
              }

              return {
                value,
                className: "text-right relative group",
                style: {
                  minWidth: "5rem",
                  paddingRight: "1.25rem",
                },
                extra: (
                  <>
                    <FaLongArrowAltUp
                      className={clsx(
                        "absolute top-1/2 right-1.5 -translate-y-1/2",
                        diff > 0 ? "text-bonus-color" : "text-danger-2 rotate-180"
                      )}
                    />
                    <span
                      className={clsx(
                        "absolute bottom-1/2 right-5 z-10 mb-2.5 pt-1 px-2 pb-0.5 rounded font-bold bg-black shadow-white-glow hidden group-hover:block",
                        diff > 0 ? "text-bonus-color" : "text-danger-2"
                      )}
                    >
                      {diff > 0 ? "+" : "-"}
                      {percenttDiff}%
                    </span>
                  </>
                ),
              };
            });

            return { cells };
          }}
        />
      </div>
    </div>
  );
}
