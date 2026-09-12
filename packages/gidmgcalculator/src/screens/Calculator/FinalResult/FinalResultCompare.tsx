import { useEffect, useRef, useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { Select, clsx, useScreenWatcher } from "rond";

import type { CalcAspect } from "@/logic/calculation";
import type { CalcResultKey } from "@/logic/calculator";

import { FinalResultLayout, type FinalResultLayoutProps } from "@/components/FinalResultView";
import { SLOT_NAME } from "@/constants/ui";
import { updateMain } from "@Store/calculator/actions";
import { useLayoutProps } from "./hooks/useLayoutProps";

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
  extraKeys?: string[];
};

export function FinalResultCompare({ comparedIds, extraKeys }: FinalResultCompareProps) {
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

  const parseResultItem = (setupId: number, mainKey: CalcResultKey, subKey: string) => {
    const item = setupsById[setupId].result[mainKey].get(subKey);
    const values: number[] = [];
    let view = "-";

    if (item === undefined) {
      return { values, view };
    }

    switch (item.type) {
      case "attack": {
        const displayParts: number[] = [];
        let total = 0;

        for (const result of item.results) {
          const aspectValue = result[focusedAspect];

          total += aspectValue;
          values.push(aspectValue);
          displayParts.push(Math.round(aspectValue));
        }

        if (total > 0) {
          view = displayParts.join(" + ");
        }
        break;
      }
      case "healing":
      case "shield":
      case "other": {
        values.push(item.result);

        if (item.result > 0 && focusedAspect !== "crit") {
          view = Math.round(item.result).toString();
        }
        break;
      }
      default:
        item satisfies never;
    }

    return { values, view };
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
          onChange={(value) => setFocusedAspect(value)}
          getPopupContainer={() => containerRef.current!}
        />
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultLayout
          {...layoutProps}
          talentMutable
          showTalentLv={false}
          extraKeys={extraKeys}
          onTalentLevelChange={(talentType, newLevel) => {
            updateMain(
              {
                [talentType]: newLevel,
              },
              comparedIds,
            );
          }}
          getRowConfig={(mainKey, subKey) => {
            const standardRecord = parseResultItem(standardId, mainKey, subKey);
            const standardValue = standardRecord.values[0];

            const cells = setupIds.map<CellConfig>((setupId, index) => {
              if (index === 0) {
                return {
                  value: standardRecord.view,
                  className: "text-right",
                };
              }

              const record = parseResultItem(setupId, mainKey, subKey);
              const diff = record.values[0] - standardValue;
              const percenttDiff = standardValue
                ? Math.round((Math.abs(diff) * 1000) / standardValue) / 10
                : 0;

              if (percenttDiff < 0.1) {
                return {
                  value: record.view,
                  className: "text-right",
                };
              }

              const diffCls = isMobile
                ? setupId === activeDiffCell.setupId && subKey === activeDiffCell.subKey
                  ? "block"
                  : "hidden"
                : "hidden group-hover:block";

              return {
                value: record.view,
                className: "min-w-20 pr-5 text-right relative group",
                extra: (
                  <>
                    <FaLongArrowAltUp
                      className={clsx(
                        "absolute top-1/2 right-1.5 -translate-y-1/2",
                        diff > 0 ? "text-bonus" : "text-danger-2 rotate-180",
                      )}
                    />
                    <span
                      className={clsx(
                        "absolute bottom-1/2 right-5 z-10 mb-2.5 pt-1 px-2 pb-0.5 rounded font-semibold bg-black shadow-popup",
                        diffCls,
                        diff > 0 ? "text-bonus" : "text-danger-2",
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
