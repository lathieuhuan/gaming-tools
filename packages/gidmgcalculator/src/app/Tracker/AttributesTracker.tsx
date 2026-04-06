import { round } from "ron-utils";
import { clsx } from "rond";

import type { AllAttributesControl } from "@/models/Character";

import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { suffixOf } from "@/utils/pure.utils";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";

import { Heading, RecordContainer, RecordItem, RecordList } from "./_components";

type AttributesTrackerProps = {
  listClassName?: string;
  allAttrsCtrl: AllAttributesControl;
};

export function AttributesTracker({ listClassName, allAttrsCtrl }: AttributesTrackerProps) {
  const { t } = useTranslation();
  const allAttrs = useCalcStore((state) => selectSetup(state).main.allAttrsCtrl.finals);

  return (
    <div className={clsx("pl-2 pt-2 pr-4", listClassName)}>
      {CORE_STAT_TYPES.map((statType) => {
        const logs = allAttrsCtrl.getLogs(statType);
        const logs_ = allAttrsCtrl.getLogs(`${statType}_`);
        const base = allAttrsCtrl.getBase(statType);

        return (
          <div key={statType} className="break-inside-avoid">
            <Heading extra={Math.round(allAttrs.get(statType))}>{t(statType)}</Heading>

            <RecordContainer>
              {logs.map((log, index) => (
                <RecordItem key={index} label={log.label} value={round(log.value, 1)} />
              ))}

              {logs_.map((log, index) => {
                const value = round(log.value, 2);
                const mult = round(value / 100, 4);
                const extraDesc = `${value}% = ${round(base, 1)} * ${mult} =`;

                return (
                  <RecordItem
                    key={`_${index}`}
                    label={log.label}
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
        const logs = allAttrsCtrl.getLogs(statType);

        return (
          <div key={statType} className="break-inside-avoid">
            <Heading extra={round(allAttrsCtrl.getTotal(statType), 2) + percent}>
              {t(statType)}
            </Heading>

            <RecordList records={logs} calcFn={(value) => round(value, 1) + percent} />
          </div>
        );
      })}
    </div>
  );
}
