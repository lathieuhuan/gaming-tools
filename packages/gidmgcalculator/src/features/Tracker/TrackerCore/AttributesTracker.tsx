import { round } from "rond";

import type { Tracker } from "@Src/types";
import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES } from "@Src/constants";
import { useTranslation } from "@Src/hooks";
import { applyPercent, suffixOf } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { selectTotalAttr } from "@Store/calculator-slice";
import { recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";

export function AttributesTracker({ totalAttr }: Partial<Pick<Tracker, "totalAttr">>) {
  const { t } = useTranslation();
  const calcTotalAttr = useSelector(selectTotalAttr);

  return (
    <div className={"pl-2 pr-4 " + recordListStyles}>
      {CORE_STAT_TYPES.map((statType) => {
        const records = totalAttr?.[statType] || [];
        const base_records = totalAttr?.[`base_${statType}`] || [];
        const records_ = totalAttr?.[`${statType}_`] || [];

        return (
          <div key={statType} className="break-inside-avoid">
            {renderHeading(t(statType), Math.round(calcTotalAttr[statType]))}

            <ul className="pl-4 list-disc">
              {records.map(renderRecord((value) => round(value, 1)))}
              {base_records.map(renderRecord((value) => round(value, 1)))}

              {records_.map(
                renderRecord(
                  (value) => applyPercent(value, calcTotalAttr[`base_${statType}`]),
                  (value) => {
                    const value_ = round(value, 2);
                    const value__ = round(value_ / 100, 4);

                    return `${value_}% = ${calcTotalAttr[`base_${statType}`]} * ${value__} =`;
                  }
                )
              )}
            </ul>
          </div>
        );
      })}

      {ATTRIBUTE_STAT_TYPES.slice(6).map((statType) => {
        const percent = suffixOf(statType);

        return (
          <div key={statType} className="break-inside-avoid">
            {renderHeading(t(statType), round(calcTotalAttr[statType], 2) + percent)}

            {totalAttr?.[statType].length ? (
              <ul className="pl-4 list-disc">
                {totalAttr?.[statType].map(renderRecord((value) => round(value, 1) + percent))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
