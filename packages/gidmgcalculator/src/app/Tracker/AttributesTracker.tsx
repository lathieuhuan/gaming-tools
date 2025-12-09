import { clsx } from "rond";

import type { TotalAttributeControl } from "@/calculation-new/core/CharacterCalc";

import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES } from "@/constants";
import { useTranslation } from "@/hooks";
import { round, suffixOf } from "@/utils";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";

import { Heading, RecordContainer, RecordItem, RecordList } from "./_components";

type AttributesTrackerProps = {
  listClassName?: string;
  totalAttrCtrl: TotalAttributeControl;
};

export function AttributesTracker({ listClassName, totalAttrCtrl }: AttributesTrackerProps) {
  const { t } = useTranslation();
  const totalAttrs = useCalcStore((state) => selectSetup(state).char.totalAttrs);

  return (
    <div className={clsx("pl-2 pt-2 pr-4", listClassName)}>
      {CORE_STAT_TYPES.map((statType) => {
        const records = totalAttrCtrl.getRecords(statType);
        const records_ = totalAttrCtrl.getRecords(`${statType}_`);
        const base = totalAttrCtrl.getBase(statType);

        return (
          <div key={statType} className="break-inside-avoid">
            <Heading extra={Math.round(totalAttrs.get(statType))}>{t(statType)}</Heading>

            <RecordContainer>
              {records.map((record, index) => (
                <RecordItem key={index} label={record.label} value={round(record.value, 1)} />
              ))}

              {records_.map((record, index) => {
                const value = round(record.value, 2);
                const mult = round(value / 100, 4);
                const extraDesc = `${value}% = ${round(base, 1)} * ${mult} =`;

                return (
                  <RecordItem
                    key={`_${index}`}
                    label={record.label}
                    value={value}
                    extraDesc={extraDesc}
                  />
                );
              })}
            </RecordContainer>
          </div>
        );
      })}

      {ATTRIBUTE_STAT_TYPES.slice(6).map((statType) => {
        const percent = suffixOf(statType);
        const records = totalAttrCtrl.getRecords(statType);

        return (
          <div key={statType} className="break-inside-avoid">
            <Heading extra={round(totalAttrCtrl.getTotal(statType), 2) + percent}>
              {t(statType)}
            </Heading>

            <RecordList records={records} calcFn={(value) => round(value, 1) + percent} />
          </div>
        );
      })}
    </div>
  );
}
