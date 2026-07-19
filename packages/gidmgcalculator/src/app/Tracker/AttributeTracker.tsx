import { round } from "ron-utils";
import { clsx } from "rond";

import type { AllAttributesControl } from "@/models/Character";

import { ATTRIBUTE_STAT_TYPES, CORE_STAT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { suffixOf } from "@/utils/pure.utils";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";

import { Heading, Container, Item, List } from "./components/ResourceLayout";

type AttributeTrackerProps = {
  listClassName?: string;
  allAttrsCtrl: AllAttributesControl;
};

export function AttributeTracker({ listClassName, allAttrsCtrl }: AttributeTrackerProps) {
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
            <Heading label={t(statType)} value={Math.round(allAttrs.get(statType))} />

            <Container>
              {logs.map((log, index) => (
                <Item key={index} label={log.label} value={round(log.value, 1)} />
              ))}

              {logs_.map((log, index) => {
                const value = round(log.value, 2);
                const mult = round(value / 100, 4);
                const label = `${log.label} ${value}% = ${round(base, 1)} * ${mult} =`;

                return <Item key={`${index}_`} label={label} value={Math.round(base * mult)} />;
              })}
            </Container>
          </div>
        );
      })}

      {ATTRIBUTE_STAT_TYPES.slice(6).map((statType) => {
        const percent = suffixOf(statType);
        const logs = allAttrsCtrl.getLogs(statType);

        return (
          <div key={statType} className="break-inside-avoid">
            <Heading
              label={t(statType)}
              value={round(allAttrsCtrl.getTotal(statType), 2) + percent}
            />
            <List records={logs} calcFn={(value) => round(value, 1) + percent} />
          </div>
        );
      })}
    </div>
  );
}
