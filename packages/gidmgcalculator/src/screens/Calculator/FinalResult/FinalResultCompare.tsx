import { useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { Select, clsx } from "rond";
import { TALENT_TYPES, CalculationAspect, TalentType, CalcTeamData } from "@Calculation";

import type { Weapon } from "@Src/types";
import Array_ from "@Src/utils/array-utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectSetupManageInfos, selectStandardId, updateCharacter } from "@Store/calculator-slice";

//
import { FinalResultLayout, type FinalResultLayoutProps } from "@Src/components";

type CellConfig = ReturnType<FinalResultLayoutProps["getRowConfig"]>["cells"][number];

const ASPECT_LABEL: Record<CalculationAspect, string> = {
  nonCrit: "Non-crit",
  crit: "Crit",
  average: "Average",
};

interface FinalResultCompareProps {
  comparedIds: number[];
  teamData: CalcTeamData;
  weapon: Weapon;
}
export function FinalResultCompare({ comparedIds, teamData, weapon }: FinalResultCompareProps) {
  const dispatch = useDispatch();
  const resultById = useSelector((state) => state.calculator.resultById);
  const standardId = useSelector(selectStandardId);

  const [focusedAspect, setFocusedAspect] = useState<CalculationAspect>("average");

  const { setupIds, ...layoutProps } = useLayoutProps(comparedIds, standardId, teamData);

  const calculationAspects: CalculationAspect[] = ["nonCrit", "crit", "average"];

  const getValue = (setupId: number, mainKey: "NAs" | "ES" | "EB" | "WP_CALC" | "RXN_CALC", subKey: string) => {
    return resultById[setupId].finalResult[mainKey][subKey][focusedAspect];
  };

  const getComparedValue = (value: number | number[]) => {
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex">
        <p className="mr-2">Choose a focus</p>
        <Select
          className="w-24 h-6 overflow-hidden text-primary-1"
          dropdownCls="z-20"
          transparent
          options={calculationAspects.map((aspect) => ({ label: ASPECT_LABEL[aspect], value: aspect }))}
          value={focusedAspect}
          onChange={(value) => setFocusedAspect(value as CalculationAspect)}
        />
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultLayout
          {...layoutProps}
          appCharacter={teamData.activeAppMember}
          talentMutable
          weapon={weapon}
          onChangeTalentLevel={(talentType, newLevel) => {
            dispatch(
              updateCharacter({
                [talentType]: newLevel,
                setupIds: comparedIds,
              })
            );
          }}
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
                        "absolute bottom-1/2 right-5 z-10 mb-2.5 pt-1 px-2 pb-0.5 rounded font-semibold bg-black shadow-white-glow hidden group-hover:block",
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

type LayoutProps = Pick<FinalResultLayoutProps, "showWeaponCalc" | "headerConfigs" | "getTalentLevel"> & {
  setupIds: number[];
};
function useLayoutProps(comparedIds: number[], standardId: number, teamData: CalcTeamData): LayoutProps {
  const setupManageInfos = useSelector(selectSetupManageInfos);
  const setupsById = useSelector((state) => state.calculator.setupsById);

  const standardWeapon = setupsById[standardId].weapon.code;
  let showWeaponCalc = true;

  for (const id of comparedIds) {
    if (setupsById[id].weapon.code !== standardWeapon) {
      showWeaponCalc = false;
      break;
    }
  }

  const setupIds = [standardId].concat(comparedIds.filter((id) => id !== standardId));

  const talent = {} as Record<TalentType, { areSame: boolean; levels: number[] }>;

  for (const talentType of TALENT_TYPES) {
    const levels = setupIds.map((id) => teamData.getFinalTalentLv(talentType, setupsById[id].char));

    talent[talentType] = {
      areSame: new Set(levels).size === 1,
      levels,
    };
  }

  const headerConfigs: LayoutProps["headerConfigs"] = setupIds.map((id, setupIndex) => {
    const text = Array_.findById(setupManageInfos, id)?.name || "";

    return {
      content: (talentType) => {
        const talentCalc = talentType ? talent[talentType] : undefined;
        const talentLevel = talentCalc && !talentCalc.areSame ? talentCalc.levels[setupIndex] : undefined;

        if (talentLevel) {
          return (
            <div className="flex flex-col items-center">
              <span>{text}</span>
              <span className="px-1 rounded-sm text-xs font-bold text-secondary-1">Lv.{talentLevel}</span>
            </div>
          );
        }

        return text;
      },
    };
  });

  return {
    showWeaponCalc,
    headerConfigs,
    setupIds,
    getTalentLevel: (talentType) => (talent[talentType].areSame ? talent[talentType].levels[0] : 0),
  };
}
