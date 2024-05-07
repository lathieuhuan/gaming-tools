import { round } from "rond";
import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES, TrackerResult } from "@Backend";

import { useTranslation } from "@Src/hooks";
import { applyPercent, Utils_ } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { selectTotalAttr } from "@Store/calculator-slice";
import { recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";

export function AttributesTracker({ totalAttr }: Partial<Pick<TrackerResult, "totalAttr">>) {
  const { t } = useTranslation();
  const calcTotalAttr = useSelector(selectTotalAttr);

  return (
    <div className={"pl-2 pt-2 pr-4 " + recordListStyles}>
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
                  (value) => applyPercent(calcTotalAttr[`${statType}_base`], value),
                  (value) => {
                    const value_ = round(value, 2);
                    const value__ = round(value_ / 100, 4);

                    return `${value_}% = ${calcTotalAttr[`${statType}_base`]} * ${value__} =`;
                  }
                )
              )}
            </ul>
          </div>
        );
      })}

      {ATTRIBUTE_STAT_TYPES.slice(6).map((statType) => {
        const percent = Utils_.suffixOf(statType);

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
