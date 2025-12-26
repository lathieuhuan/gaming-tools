import { useRef, useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { Select, clsx } from "rond";

import type { CalcResult } from "@/calculation/calculator/types";
import type { CalcAspect, CalcResultItemValue } from "@/calculation/types";
import type { TalentType } from "@/types";
import type { CalculatorState } from "@Store/calculator/types";

import { displayValues } from "@/components/FinalResultView";
import { TALENT_TYPES } from "@/constants/global";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateMain } from "@Store/calculator/actions";

import { FinalResultLayout, type FinalResultLayoutProps } from "@/components";

type CellConfig = ReturnType<FinalResultLayoutProps["getRowConfig"]>["cells"][number];

type CalcAspectOption = {
  label: string;
  value: CalcAspect;
};

const CALC_ASPECT_OPTIONS: CalcAspectOption[] = [
  { label: "Non-crit", value: "base" },
  { label: "Crit", value: "crit" },
  { label: "Average", value: "average" },
];

type FinalResultCompareProps = {
  comparedIds: number[];
};

export function FinalResultCompare({ comparedIds }: FinalResultCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedAspect, setFocusedAspect] = useState<CalcAspect>("average");

  const { setupIds, standardId, setupsById, ...layoutProps } = useLayoutProps(comparedIds);

  const getValues = (setupId: number, mainKey: keyof CalcResult, subKey: string) => {
    return setupsById[setupId].result[mainKey][subKey].values;
  };

  const getComparedValue = (values: CalcResultItemValue[]) => {
    return values.at(0)?.[focusedAspect] || 0;
  };

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      <div className="mb-4 flex">
        <p className="mr-2">Choose a focus</p>
        <Select
          className="w-24 h-6 overflow-hidden text-primary-1"
          dropdownCls="z-20"
          transparent
          options={CALC_ASPECT_OPTIONS}
          value={focusedAspect}
          onChange={(value) => setFocusedAspect(value as CalcAspect)}
          getPopupContainer={() => containerRef.current!}
        />
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultLayout
          {...layoutProps}
          talentMutable
          showTalentLv={false}
          onTalentLevelChange={(talentType, newLevel) => {
            updateMain(
              {
                [talentType]: newLevel,
              },
              comparedIds
            );
          }}
          getRowConfig={(mainKey, subKey) => {
            const standardValues = getValues(standardId, mainKey, subKey);

            const cells = setupIds.map<CellConfig>((id, index) => {
              if (!index) {
                return {
                  value: displayValues(standardValues, focusedAspect),
                  className: "text-right",
                };
              }

              const values = getValues(id, mainKey, subKey);
              const comparedStandardValue = getComparedValue(standardValues);
              const diff = getComparedValue(values) - comparedStandardValue;
              const percenttDiff = comparedStandardValue
                ? Math.round((Math.abs(diff) * 1000) / comparedStandardValue) / 10
                : 0;

              if (percenttDiff < 0.1) {
                return {
                  value: displayValues(values, focusedAspect),
                  className: "text-right",
                };
              }

              return {
                value: displayValues(values, focusedAspect),
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
                        diff > 0 ? "text-bonus" : "text-danger-2 rotate-180"
                      )}
                    />
                    <span
                      className={clsx(
                        "absolute bottom-1/2 right-5 z-10 mb-2.5 pt-1 px-2 pb-0.5 rounded font-semibold bg-black shadow-popup hidden group-hover:block",
                        diff > 0 ? "text-bonus" : "text-danger-2"
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

type UseLayoutPropsReturn = Pick<
  FinalResultLayoutProps,
  "showWeaponCalc" | "headerConfigs" | "character"
> &
  Pick<CalculatorState, "setupsById" | "standardId"> & {
    setupIds: number[];
  };

function useLayoutProps(comparedIds: number[]): UseLayoutPropsReturn {
  const { setupManagers, setupsById, standardId } = useShallowCalcStore((state) =>
    Object_.pickProps(state, ["setupManagers", "setupsById", "standardId"])
  );

  const standardWeapon = setupsById[standardId].main.weapon.code;
  const showWeaponCalc = comparedIds.some(
    (id) => setupsById[id].main.weapon.code !== standardWeapon
  );
  const setupIds = [standardId].concat(comparedIds.filter((id) => id !== standardId));

  const talent = {} as Record<TalentType, { areSame: boolean; levels: number[] }>;

  for (const talentType of TALENT_TYPES) {
    const levels = setupIds.map((id) => setupsById[id].main.getFinalTalentLv(talentType));

    talent[talentType] = {
      areSame: new Set(levels).size === 1,
      levels,
    };
  }

  const headerConfigs: UseLayoutPropsReturn["headerConfigs"] = setupIds.map((id, setupIndex) => {
    const text = Array_.findById(setupManagers, id)?.name || "";

    return {
      content: (talentType) => {
        const talentCalc = talentType ? talent[talentType] : undefined;
        const talentLevel =
          talentCalc && !talentCalc.areSame ? talentCalc.levels[setupIndex] : undefined;

        if (talentLevel) {
          return (
            <div className="flex flex-col items-center">
              <span>{text}</span>
              <span className="px-1 rounded-sm text-xs font-bold text-secondary-1">
                Lv.{talentLevel}
              </span>
            </div>
          );
        }

        return text;
      },
    };
  });

  return {
    character: setupsById[standardId].main,
    showWeaponCalc,
    headerConfigs,
    setupIds,
    standardId,
    setupsById,
  };
}
