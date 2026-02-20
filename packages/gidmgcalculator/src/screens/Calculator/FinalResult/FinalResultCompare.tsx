import { useEffect, useRef, useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { Select, clsx, useScreenWatcher } from "rond";

import type { CalcResult } from "@/calculation/calculator";
import type { CalcAspect, CalcResultItemValue } from "@/calculation/types";

import { displayValues } from "@/components/FinalResultView";
import { updateMain } from "@Store/calculator/actions";
import { useLayoutProps } from "./_useLayoutProps";

import { FinalResultLayout, type FinalResultLayoutProps } from "@/components";
import { SLOT_NAME } from "@/constants";

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
  const isMobile = !useScreenWatcher().isFromSize("md");
  const [focusedAspect, setFocusedAspect] = useState<CalcAspect>("average");
  const [activeDiffCell, setActiveDiffCell] = useState({
    setupId: 0,
    subKey: "",
  });

  const { setupIds, standardId, setupsById, ...layoutProps } = useLayoutProps(comparedIds);

  useEffect(() => {
    if (isMobile) {
      const handleClickOutside = (e: MouseEvent) => {
        const { target } = e;
        const diffCellElmt =
          target instanceof Element
            ? target.closest(`[data-slot="${SLOT_NAME.resultDiffCell}"]`)
            : null;

        if (!diffCellElmt) {
          setActiveDiffCell({ setupId: 0, subKey: "" });
        }
      };

      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isMobile]);

  const getValues = (setupId: number, mainKey: keyof CalcResult, subKey: string) => {
    // Can be undefined in weapon DMG calc when the standard setup has weapon dealing DMG
    // and compared setups don't.
    return setupsById[setupId].result[mainKey]?.[subKey]?.values || [];
  };

  const getComparedValue = (values: CalcResultItemValue[]) => {
    return values.at(0)?.[focusedAspect] || 0;
  };

  const handleClickDiffCell = (setupId: number, subKey: string) => {
    if (isMobile) {
      setActiveDiffCell({
        setupId,
        subKey,
      });
    }
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

            const cells = setupIds.map<CellConfig>((setupId, index) => {
              if (!index) {
                return {
                  value: displayValues(standardValues, focusedAspect),
                  className: "text-right",
                };
              }

              const values = getValues(setupId, mainKey, subKey);
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

              const diffCls = isMobile
                ? setupId === activeDiffCell.setupId && subKey === activeDiffCell.subKey
                  ? "block"
                  : "hidden"
                : "hidden group-hover:block";

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
                        "absolute bottom-1/2 right-5 z-10 mb-2.5 pt-1 px-2 pb-0.5 rounded font-semibold bg-black shadow-popup",
                        diffCls,
                        diff > 0 ? "text-bonus" : "text-danger-2"
                      )}
                    >
                      {diff > 0 ? "+" : "-"}
                      {percenttDiff}%
                    </span>
                  </>
                ),
                "data-slot": SLOT_NAME.resultDiffCell,
                onClick: () => handleClickDiffCell(setupId, subKey),
              };
            });

            return { cells };
          }}
        />
      </div>
    </div>
  );
}
